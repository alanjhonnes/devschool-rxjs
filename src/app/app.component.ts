import { Component } from '@angular/core';
import { combineLatest, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, exhaustMap, finalize, map, mergeMap, retry, switchMap, tap } from 'rxjs/operators';
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
  currentPostId$: Observable<number | null>;

  getPostClick$ = new Subject<any>()

  constructor(
    public postsService: PostsService,
    public stateService: StateService,
  ) {
    this.state$ = this.stateService.getStateStream()
      .pipe(
        tap({
          next: (state) => {
            console.log(`tap next: ${JSON.stringify(state)}`)
          }
        })
      )
      ;

    this.posts$ = this.state$
      .pipe(
        map(state => state.posts),
        distinctUntilChanged()
      )

    this.postCount$ = this.posts$
      .pipe(
        map(
          posts => posts.length,
        )
      )

    this.currentPostId$ = this.state$
      .pipe(
        map(state => state.currentPostId),
        distinctUntilChanged()
      )

    this.currentPost$ = combineLatest([
      this.posts$,
      this.currentPostId$
    ])
      .pipe(
        tap({
          next: values => {
            console.log("tap values combine latest")
          }
        }),
        map(([posts, currentPostId]) => {
          if (currentPostId === null) {
            return null
          }
          return posts
            .find(post => post.id === currentPostId) || null
        })
      )

    this.getPostClick$
      .pipe(
        switchMap((id) => {
          return this.postsService.getPost(id)
        })
      )
      .subscribe({
        next: (posts) => {
          console.log("posts received", posts)
        }
      })
  }

  getPostClicked() {
    this.getPostClick$.next({})
  }

  getPosts() {
    this.loading = true
    this.postsService.getPosts()
      .pipe(
        retry(3),
        finalize(() => {
          this.loading = false
        })
      )
      .subscribe({
        next: (posts) => {
          console.log(`getPosts next:`, posts);
          this.posts = posts;
        },
        error: (error) => {
          console.log(`getPosts error:`, error)
        },
        complete: () => {
          console.log(`getPosts complete`)
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
