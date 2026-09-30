# Bug Report

## Bug 1: Pagination returned the wrong page

### Description
The `GET /tasks` pagination logic calculated the starting offset incorrectly.

### Original behavior
The pagination logic used:

```js
const offset = page * limit;