import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { PostsService } from './posts.service';
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
  currentPost$: Observable<Post | null>;

  constructor(
    public postsService: PostsService,
    public stateService: StateService,
  ) {
    this.state$ = this.stateService.getStateStream()
      // .pipe(
      //   tap({
      //     next: console.log,
      //     error: console.error,
      //     complete: console.warn,
      //   }),
      // )
      ;

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

    this.currentPost$ = this.state$
      .pipe(
        map(state => {
          if (state.currentPostId === null) {
            return null
          }
          return state.posts
            .find(post => post.id === state.currentPostId) || null
        })
      )
  }

  getPosts() {
    this.loading = true
    this.postsService.getPosts()
      .subscribe({
        next: (posts) => {
          console.log(`getPosts next:`, posts);
          this.posts = posts;
          this.loading = false
        },
        error: (error) => {
          console.log(`getPosts error:`, error)
          this.loading = false
        },
        complete: () => {
          console.log(`getPosts complete`)
          this.loading = false
        },
      })

  }

  getPost(id: number) {
    this.postsService.getPost(id)
      .subscribe({
        next: (post) => console.log(`getPost next ${id}:`, post),
        error: (error) => console.log(`getPost error ${id}:`, error),
        complete: () => console.log(`getPost complete ${id}`),
      })
  }

  getPostStream() {
    return this.postsService.getStreamOfPosts()
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
    this.postsService.changePosts();
  }

  selectPost(postId: number) {
    this.stateService.selectPost(postId)
  }
}
