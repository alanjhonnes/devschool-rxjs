import { Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { combineLatest, merge, Observable, Subject } from 'rxjs';
import { concatMap, debounceTime, exhaustMap, map, mergeMap, mergeScan, scan, share, shareReplay, switchMap, take, takeUntil, takeWhile, tap, throttleTime, timeout } from 'rxjs/operators';
import { RequestsService } from './requests.service';
import { PostsState, StateService } from './state.service';
import { Post } from './types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {

  posts: Post[] = [];
  loading: boolean = false;

  state$: Observable<PostsState>;
  postCount$: Observable<number>;
  posts$: Observable<Post[]>;

  searchControl: FormControl;
  filter$: Observable<string>;
  filteredPosts$: Observable<Post[]>;
  filteredPostsBackend$: Observable<Post[]>;

  destroy$ = new Subject<void>();

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
        takeUntil(this.destroy$)
      );

    const stateSubscription = this.state$.subscribe();


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
      );

    this.searchControl = new FormControl('');
    this.filter$ = this.searchControl.valueChanges
      .pipe(
        // debounceTime(500),
        tap({
          next: (search) => {
            console.log({
              search
            })
          }
        }),
        shareReplay(1),
      )

    this.filteredPosts$ = combineLatest([
      this.filter$,
      this.posts$,
    ])
      .pipe(
        map(([filter, posts]) => {
          if (filter === null || filter.trim() === '') {
            return posts;
          }
          return posts.filter(post => post.title.includes(filter));
        })
      )

    this.filteredPostsBackend$ = this.filter$
      .pipe(
        tap({
          next: (filter) => {
            console.log(`filteredPostsBackend filter`, filter);
          }
        }),
        exhaustMap(filter => {
          return this.getPosts(filter);
        }),
        tap({
          next: (posts) => {
            console.log(`filteredPostsBackend posts`, posts);
          }
        }),
        takeUntil(this.destroy$),
        share(),
      )



    // this.cruzamentoFilters$ = merge([this.filter$, this.filteredPostsBackend$])
    //   .pipe(
    //     scan((acc, [filter, posts]) => {

    //     }))
    //     )




  }

  getPosts(filter: string) {
    return this.requestsService.getPosts(filter);
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
