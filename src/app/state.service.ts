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

  setState(state: Partial<PostsState>) {
    this.state$.next({
      ...this.state$.getValue(),
      ...state,
    });
  }

  getStateStream() {
    return this.state$.asObservable();
  }

  getState() {
    return this.state$.getValue();
  }
}
