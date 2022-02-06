import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { interval, lastValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';

import { environment } from 'src/environments/environment';

interface IAttributes {
  drupal_internal__nid: string;
  title: string;
}

interface IArticle {
  attributes: IAttributes;
}

@Component({
  selector: 'app-drupal',
  templateUrl: './drupal.component.html',
  styleUrls: ['./drupal.component.scss'],
})
export class DrupalComponent implements OnInit {
  li: any;
  lis: any[] = [];
  endpoint: string = `${environment.api_endpoint}/node/article?sort=title`;
  loading: boolean = false;

  listQuota = 5;
  content = [];
  baseUrl = `${environment.api_endpoint}`;
  path = '/node/article?sort=nid';
  pager = `&page[limit]=${this.listQuota}&include=field_image`;
  prev: string = '';
  next: string = '';
  current: string = '';

  constructor(private http: HttpClient) {}

  async ngOnInit(): Promise<any> {
    const url = this.baseUrl + this.path + this.pager;
    console.log('url', url);
    // const url = `${environment.api_endpoint}/node/article?include=field_image`;
    this.getAndSetContent(url);
  }

  // getAndSetContent(link: string) {
  //   fetch(link)
  //     .then((resp) => {
  //       return resp.ok ? resp.json() : Promise.reject(resp.statusText);
  //     })
  //     .then((document) => {
  //       this.lis.push(...document.data);
  //       this.lis = this.lis.slice(0, this.listQuota);

  //       const hasNextPage = document.links.hasOwnProperty('next');
  //       console.log('hasNextPage', hasNextPage);

  //       // if (this.lis.length <= this.listQuota && hasNextPage) {
  //       //   console.log('document.links.next', document.links.next);
  //       //   this.getAndSetContent(document.links.next.href);
  //       // }

  //       // if (content.length > listQuota || hasNextPage) {
  //       //   const nextPageLink = hasNextPage
  //       //     ? document.links.next
  //       //     : null;
  //       //   listComponent.showNextPageLink(nextPageLink);
  //       // }
  //       console.log('document', document);
  //       console.log('this.lis', this.lis);
  //     })
  //     .catch(console.log);
  // }

  getAndSetContent(link: string) {
    this.loading = true;
    fetch(link)
      .then((resp) => {
        return resp.ok ? resp.json() : Promise.reject(resp.statusText);
      })
      .then(async (document) => {
        console.log('document', document);

        let list: any[] = [];

        await Promise.all(
          document.data.map((node: any) => {
            const file = document.included.filter(
              (item: any) => item.id === node.relationships.field_image.data.id
            );
            let url_file = '';
            if (file.length) {
              url_file = file[0].attributes.image_style_uri.find(
                (element: any, index: number) =>
                  Object.getOwnPropertyNames(element)[0] === 'thumbnail'
              ).thumbnail;
            }

            list.push({
              id: node.attributes.drupal_internal__nid,
              title: node.attributes.title,
              file: url_file,
            });
          })
        );

        this.lis = list;

        // Pagination
        this.prev = document.links.prev ? document.links.prev.href : '';
        this.next = document.links.next ? document.links.next.href : '';
        this.current = document.links.current
          ? document.links.current.href
          : '';
      })
      .catch(console.log);
    this.loading = false;
  }

  async fetchFile(link: string) {
    let file: string = '';
    await fetch(link)
      .then((res) => {
        return res.ok ? res.json() : Promise.reject(res.statusText);
      })
      .then((item_file) => {
        file = item_file.data.attributes.image_style_uri[2].thumbnail;
      })
      .catch(console.log);
    return file;
  }

  nextPage() {
    console.log('this.next', this.next);
    this.getAndSetContent(this.next);
  }

  prevPage() {
    console.log('this.prev', this.prev);
    this.getAndSetContent(this.prev);
  }
}
