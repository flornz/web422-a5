import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { mergeMap } from 'rxjs/operators';
import { environment } from './../environments/environment';
import { SpotifyTokenService } from './spotify-token.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class MusicDataService {
  constructor(
    private spotifyToken: SpotifyTokenService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  public localStorageToken: any = this.authService.getToken();

  getNewReleases(): Observable<SpotifyApi.ListOfNewReleasesResponse> {
    return this.spotifyToken.getBearerToken().pipe(
      mergeMap((token) => {
        return this.http.get<SpotifyApi.ListOfNewReleasesResponse>(
          'https://api.spotify.com/v1/browse/new-releases',
          { headers: { Authorization: `Bearer ${token}` } }
        );
      })
    );
  }

  getArtistById(id: any): Observable<SpotifyApi.SingleArtistResponse> {
    return this.spotifyToken.getBearerToken().pipe(
      mergeMap((token) => {
        return this.http.get<SpotifyApi.SingleArtistResponse>(
          `https://api.spotify.com/v1/artists/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      })
    );
  }

  getAlbumsByArtistId(id: any): Observable<SpotifyApi.ArtistsAlbumsResponse> {
    return this.spotifyToken.getBearerToken().pipe(
      mergeMap((token) => {
        return this.http.get<SpotifyApi.ArtistsAlbumsResponse>(
          `https://api.spotify.com/v1/artists/${id}/albums?include_groups=album,single&limit=50`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      })
    );
  }

  getAlbumById(id: any): Observable<SpotifyApi.SingleAlbumResponse> {
    return this.spotifyToken.getBearerToken().pipe(
      mergeMap((token) => {
        return this.http.get<SpotifyApi.SingleAlbumResponse>(
          `https://api.spotify.com/v1/albums/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      })
    );
  }

  getAlbumTracksById(id: any): Observable<SpotifyApi.AlbumTracksResponse> {
    return this.spotifyToken.getBearerToken().pipe(
      mergeMap((token) => {
        return this.http.get<SpotifyApi.AlbumTracksResponse>(
          `https://api.spotify.com/v1/albums/${id}/tracks`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      })
    );
  }

  searchArtists(
    searchString: string
  ): Observable<SpotifyApi.ArtistSearchResponse> {
    return this.spotifyToken.getBearerToken().pipe(
      mergeMap((token) => {
        return this.http.get<SpotifyApi.ArtistSearchResponse>(
          `https://api.spotify.com/v1/search?q=${searchString}&type=artist&limit=50`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      })
    );
  }

  addToFavourites(id: string): Observable<[String]> {
    // TODO: make a PUT request to environment.userAPIBase/favourites/:id to add id to favourites
    return this.http.put<[String]>(
      `${environment.userAPIBase}/favourites/${id}`,
      {
        headers: { Authorization: `Bearer ${this.localStorageToken}` },
      }
    );
  }

  removeFromFavourites(id: string): Observable<any> {
    return this.http
      .delete<[String]>(`${environment.userAPIBase}/favourites/${id}`, {
        headers: { Authorization: `Bearer ${this.localStorageToken}` },
      })
      .pipe(
        mergeMap((favouritesArray) => {
          // TODO: Perform the same tasks as the original getFavourites() method, only using "favouritesArray" from above, instead of this.favouritesList
          // NOTE: for the empty array, you will need to use o=>o.next({tracks: []}) instead of o=>{o.next([])}
          return this.getFavourites();
        })
      );
  }

  getFavourites(): Observable<any> {
    return this.http
      .get<[String]>(`${environment.userAPIBase}/favourites`, {
        headers: { Authorization: `Bearer ${this.localStorageToken}` },
      })
      .pipe(
        mergeMap((favouritesArray) => {
          // TODO: Perform the same tasks as the original getFavourites() method, only using "favouritesArray" from above, instead of this.favouritesList
          // NOTE: for the empty array, you will need to use o=>o.next({tracks: []}) instead of o=>{o.next([])}
          if (favouritesArray.length <= 0) {
            return new Observable((o) => {
              o.next([]);
            });
          }

          return this.spotifyToken.getBearerToken().pipe(
            mergeMap((token) => {
              return this.http.get<any>(
                `https://api.spotify.com/v1/tracks?ids=${favouritesArray.join()}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
            })
          );
        })
      );
  }
}
