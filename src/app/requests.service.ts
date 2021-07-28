import { Injectable } from '@angular/core';
import { interval, map, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Post } from './types';

@Injectable({
  providedIn: 'root'
})
export class RequestsService {

  posts: Post[] = [
    {
      id: 1,
      title: 'Post 1',
      content: 'Conteudo 1',
    },
    {
      id: 2,
      title: 'Post 2',
      content: 'Conteudo 2',
    }
  ]

  constructor() { }

  getPosts(): Observable<Post[]> {
    return new Observable<Post[]>(
      subscriber => {
        console.log('getPosts new subscriber');
        const timeoutId = setTimeout(() => {
          subscriber.next(this.posts);
          subscriber.complete();
          console.log('getPosts emitted');
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
        const post = this.posts.find(post => post.id === id) || null;
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
    return interval(1000)
      .pipe(
        map(() => this.posts)
      );
  }

  changePosts() {
    const numberOfPosts = Math.ceil(Math.random() * 4);
    const newPosts: Post[] = [];
    for(let i = 0; i < numberOfPosts; i++) {
      newPosts.push(createRandomPost());
    }
    this.posts = newPosts;
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
