import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Post } from './types';

export interface PostsState {
  posts: Post[],
  currentPostId: number | null,
}

@Injectable({
  providedIn: 'root'
})
export class StateService {

  private state$ = new BehaviorSubject<PostsState>({
    posts: [],
    currentPostId: null,
  });

  constructor() { }

  setState(state: Partial<PostsState>) {
    this.state$.next({
      ...this.state$.getValue(),
      ...state,
    });
  }

  getStateStream() {
    return this.state$.asObservable();
  }

  selectPost(postId: number) {
    this.state$.next({
      ...this.state$.getValue(),
      currentPostId: postId
    })
  }
}
