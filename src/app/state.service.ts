import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Post } from './types';

export interface PostsState {
  posts: Post[],
  currentPost: Post | null,
}

@Injectable({
  providedIn: 'root'
})
export class StateService {

  private state$ = new BehaviorSubject<PostsState>({
    posts: [],
    currentPost: null,
  });

  constructor() { }

  setState(state: PostsState) {
    this.state$.next(state);
  }

  getStateStream() {
    return this.state$.asObservable();
  }
}
