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
  endpoint: string = `${environment.api_endpoint}/node/article?sort=nid`;
  loading: boolean = false;

  listQuota = 5;
  content = [];
  baseUrl = `${environment.api_endpoint}`;
  path = '/node/article?sort=nid';
  pager = `&page[limit]=${this.listQuota}`;
  prev: string = '';
  next: string = '';
  current: string = '';

  constructor(private http: HttpClient) {}

  async ngOnInit(): Promise<any> {
    const url = this.baseUrl + this.path + this.pager;
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
      .then((document) => {
        console.log('document.data', document.data);

        let list: any[] = [];
        Promise.all(
          document.data.map(async (item: any) => {
            // e.attributes.drupal_internal__nid
            const file = await this.fetchFile(
              item.relationships.field_image.links.related.href
            );
            list.push({
              id: item.attributes.drupal_internal__nid,
              title: item.attributes.title,
              file,
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
