import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { combineLatest, Observable } from 'rxjs';
import { debounceTime, finalize, map, mergeMap, startWith, switchMap, tap } from 'rxjs/operators';
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
  filteredPosts$: Observable<Post[]>;

  searchControl = new FormControl('');

  constructor(
    public requestsService: RequestsService,
    public stateService: StateService,
  ) {

    this.searchControl.valueChanges
      .subscribe(valor => {
        // console.log(`valor do formulário: ${valor}`);
      })

    this.state$ = this.stateService.getStateStream()
      .pipe(
        tap({
          next: (valor) => console.log(`next valor: ${valor}`),
          error: console.error,
          complete: console.warn,
        }),
      );

    this.posts$ = this.state$.pipe(
      map(state => state.posts)
    )

    this.filteredPosts$ = this.searchControl
      .valueChanges
      .pipe(
        startWith(this.searchControl.value),
        debounceTime(1000),
        switchMap((filtro) => {
          return this.requestsService.getFilteredPosts(filtro)
        })
      )

    // this.filteredPosts$ = combineLatest([
    //   this.posts$,
    //   this.searchControl.valueChanges
    //     .pipe(
    //       startWith(this.searchControl.value),
    //     ),
    // ])
    //   .pipe(
    //     map(([posts, filtro]) => {
    //       console.log(`map: ${JSON.stringify(posts)} : ${filtro}`)
    //       return posts
    //         .filter(post => post.title.includes(filtro));
    //     })
    //   )

    this.postCount$ = this.filteredPosts$
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

  selectPost(post: Post) {
    this.stateService.setState({
      currentPost: post,
    });
  }

  getPost(id: number) {
    this.loading = true;
    this.requestsService.getPost(id)
      .pipe(
        finalize(() => {
          console.log('finalize');
          this.loading = false;
        })
      )
      .subscribe({
        next: (post) => console.log(`getPost next ${id}:`, post),
        error: (error) => {
          this.loading = false;
          console.log(`getPost error ${id}:`, error)
        },
        complete: () => {
          this.loading = false;
          console.log(`getPost complete ${id}`)
        },
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
