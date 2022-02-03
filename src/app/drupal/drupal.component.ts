import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
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
  lis: IArticle[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http
      .get(`${environment.api_endpoint}/node/article`)
      .subscribe((response) => {
        if (response) {
          // hide preload.
        }
        console.log(response);
        this.li = response;
        this.lis = this.li.data;
      });
  }
}
