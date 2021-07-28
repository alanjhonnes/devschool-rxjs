import { Component } from '@angular/core';
import { Observable } from 'rxjs';
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

  constructor(
    public requestsService: RequestsService,
    public stateService: StateService,
  ) {
    this.state$ = this.stateService.getStateStream();
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
        next: (posts) => console.log(`getPostStream next: ${posts}`),
        error: (error) => console.log(`getPostStream error: ${error}`),
        complete: () => console.log(`getPostStream complete`),
      })
    ;
  }

  changePosts() {
    this.requestsService.changePosts();
  }
}
