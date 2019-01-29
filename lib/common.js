'use strict';

const fetch = require('isomorphic-fetch');
const debug = require('debug')('app-store-scraper');
const c = require('./constants');

function cleanApp (app) {
  return {
    id: app.trackId,
    appId: app.bundleId,
    title: app.trackName,
    url: app.trackViewUrl,
    description: app.description,
    icon: app.artworkUrl512 || app.artworkUrl100 || app.artworkUrl60,
    genres: app.genres,
    genreIds: app.genreIds,
    primaryGenre: app.primaryGenreName,
    primaryGenreId: app.primaryGenreId,
    contentRating: app.contentAdvisoryRating,
    languages: app.languageCodesISO2A,
    size: app.fileSizeBytes,
    requiredOsVersion: app.minimumOsVersion,
    released: app.releaseDate,
    updated: app.currentVersionReleaseDate || app.releaseDate,
    releaseNotes: app.releaseNotes,
    version: app.version,
    price: app.price,
    currency: app.currency,
    free: app.price === 0,
    developerId: app.artistId,
    developer: app.artistName,
    developerUrl: app.artistViewUrl,
    developerWebsite: app.sellerUrl,
    score: app.averageUserRating,
    reviews: app.userRatingCount,
    currentVersionScore: app.averageUserRatingForCurrentVersion,
    currentVersionReviews: app.userRatingCountForCurrentVersion,
    screenshots: app.screenshotUrls,
    ipadScreenshots: app.ipadScreenshotUrls,
    appletvScreenshots: app.appletvScreenshotUrls,
    supportedDevices: app.supportedDevices
  };
}

// TODO add an optional parse function
const doRequest = (url, headers, requestOptions) => {
  debug('Making request: %s %j %o', url, headers, requestOptions);

  requestOptions = Object.assign({ method: 'GET', headers }, requestOptions);

  return fetch(url, requestOptions).then((response) => {
    if (!response.ok) {
      throw {response: {statusCode: response.status}};
    }
    return response.text().then(body => {
      debug('Finished request');
      return body;
    });
  });
};

const LOOKUP_URL = 'https://itunes.apple.com/lookup';

function lookup (ids, idField, country, requestOptions) {
  idField = idField || 'id';
  country = country || 'us';
  const joinedIds = ids.join(',');
  const url = `${LOOKUP_URL}?${idField}=${joinedIds}&country=${country}&entity=software`;
  return doRequest(url, {}, requestOptions)
    .then(JSON.parse)
    .then((res) => res.results.map(cleanApp));
}

function storeId (countryCode) {
  const markets = c.markets;
  const defaultStore = '143441';
  return (countryCode && markets[countryCode.toUpperCase()]) || defaultStore;
}

module.exports = { cleanApp, lookup, request: doRequest, storeId };
