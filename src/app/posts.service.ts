import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, map, Observable } from 'rxjs';
import { delay, mergeMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { StateService } from './state.service';
import { Post } from './types';

@Injectable({
  providedIn: 'root'
})
export class PostsService {

  posts$ = new BehaviorSubject<Post[]>([]);

  readonly apiPath = `${environment.apiPath}/posts`;

  constructor(
    private stateService: StateService,
  ) { }

  getPosts(): Observable<Post[]> {
    return new Observable<Post[]>(
      subscriber => {
        console.log('getPosts new subscriber');
        const timeoutId = setTimeout(() => {
          const rand = Math.random()
          if (rand > 1) {
            subscriber.error(new Error("erro"))
            console.log('erro');
          } else {
            subscriber.next(this.posts$.getValue());
            subscriber.complete();
            console.log('getPosts emitted');
          }
        }, 1000 + Math.random() * 3000);

        return () => {
          console.log('getPosts teardown');
          clearTimeout(timeoutId);
        }
      });
  }

  getPost(id: number): Observable<Post | null> {
    return new Observable<Post | null>(subscriber => {
      console.log(`getPost(${id}) new subscriber`);
      const timeoutId = setTimeout(() => {
        const post = this.posts$.getValue().find(post => post.id === id) || null;
        subscriber.next(post);
        subscriber.complete();
        console.log(`getPost(${id}) emitted`);
      }, 1000 + Math.random() * 3000);

      return () => {
        console.log(`getPost(${id}) teardown`);
        clearTimeout(timeoutId);
      }
    });
  }

  getStreamOfPosts(): Observable<Post[]> {
    return this.posts$.asObservable();
  }

  changePosts() {
    const numberOfPosts = Math.ceil(Math.random() * 4);
    const newPosts: Post[] = [];
    for (let i = 0; i < numberOfPosts; i++) {
      newPosts.push(createRandomPost());
    }
    this.posts$.next(newPosts);
    this.stateService.setState({
      posts: newPosts,
    })
  }

}

function createRandomPost(): Post {
  const id = Math.ceil(Math.random() * 5000);
  return {
    id: id,
    content: `Content ${id}`,
    title: `Title ${id}`,
  }
}
