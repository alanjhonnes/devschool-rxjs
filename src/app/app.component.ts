import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { RequestsService } from './requests.service';
import { PostsState, StateService } from './state.service';
import { Post } from './types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  posts: Post[] = [];
  loading: boolean = false;

  state$: Observable<PostsState>;
  postCount$: Observable<number>;
  posts$: Observable<Post[]>;

  constructor(
    public requestsService: RequestsService,
    public stateService: StateService,
  ) {
    this.state$ = this.stateService.getStateStream()
      .pipe(
        tap({
          next: console.log,
          error: console.error,
          complete: console.warn,
        }),
      );

    this.posts$ = this.state$
      .pipe(
        map(
          state => state.posts,
        )
      )

    this.postCount$ = this.posts$
      .pipe(
        map(
          posts => posts.length,
        )
      )
  }

  getPosts() {
    this.requestsService.getPosts()
      .subscribe({
        next: (posts) => {
          console.log(`getPosts next:`, posts);
          this.posts = posts;
        },
        error: (error) => console.log(`getPosts error:`, error),
        complete: () => console.log(`getPosts complete`),
      })

  }

  getPost(id: number) {
    this.requestsService.getPost(id)
      .subscribe({
        next: (post) => console.log(`getPost next ${id}:`, post),
        error: (error) => console.log(`getPost error ${id}:`, error),
        complete: () => console.log(`getPost complete ${id}`),
      })
  }

  getPostStream() {
    return this.requestsService.getStreamOfPosts()
      .subscribe({
        next: (posts) => {
          console.log(`getPostStream next:`, posts);
          this.posts = posts;
        },
        error: (error) => console.log(`getPostStream error:`, error),
        complete: () => console.log(`getPostStream complete`),
      })
      ;
  }

  changePosts() {
    this.requestsService.changePosts();
  }
}
