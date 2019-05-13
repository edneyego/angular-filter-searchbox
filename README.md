## Angular Filter Searchbox
[![Build Status](https://travis-ci.org/edneyego/angular-filter-searchbox.png?branch=master)](https://travis-ci.org/edneyego/angular-filter-searchbox)

A directive for AngularJS providing a filter visual search box.

### [DEMO](http://edneyego.github.io/angular-filter-searchbox/)

### Usage

Include with bower

```sh
bower install angular-filter-searchbox
```

The bower package contains files in the ```dist/```directory with the following names:

- angular-filter-searchbox.js
- angular-filter-searchbox.min.js
- angular-filter-searchbox-tpls.js
- angular-filter-searchbox-tpls.min.js

Files with the ```min``` suffix are minified versions to be used in production. The files with ```-tpls``` in their name have the directive template bundled. If you don't need the default template use the ```angular-paginate-anything.min.js``` file and provide your own template with the ```templateUrl``` attribute.

Load the javascript and css and declare your Angular dependency

```html
<!-- dependency includes -->
<script src="bower_components/jquery/dist/jquery.min.js"></script>
<script src="bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
<script src="bower_components/angular/angular.min.js"></script>
<script src="bower_components/angular-animate/angular-animate.min.js"></script>
<link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap.min.css">

<!-- optional for auto complete / suggested value feature -->
<script src="bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js"></script>

<!-- angular filter searchbox includes -->
<link rel="stylesheet" href="bower_components/angular-filter-searchbox/dist/angular-filter-searchbox.min.css">
<script src="bower_components/angular-filter-searchbox/dist/angular-filter-searchbox-tpls.min.js"></script>
```

```js
angular.module('myModule', ['angular-filter-searchbox']);
```

Define the available search parameters in your controller:

```js
$scope.availableSearchParams = [
          { key: "name", name: "Name", placeholder: "Name..." },
          { key: "city", name: "City", placeholder: "City..." },
          { key: "country", name: "Country", placeholder: "Country..." },
          { key: "emailAddress", name: "E-Mail", placeholder: "E-Mail...", allowMultiple: true },
          { key: "job", name: "Job", placeholder: "Job..." }
        ];
```

Then in your view

```html
<nit-filter-searchbox
	ng-model="searchParams"
	parameters="availableSearchParams"
	placeholder="Search...">
</nit-filter-searchbox>
```

The `angular-filter-searchbox` directive uses an external template stored in
`angular-filter-searchbox.html`.  Host it in a place accessible to
your page and set the `template-url` attribute. Note that the `url`
param can be a scope variable as well as a hard-coded string.

### Benefits

* Handles free text search and/or parameterized searches
* Provides suggestions on available search parameters
* Easy to use with mouse or keyboard
* Model could easily be used as ```params``` for Angular's ```$http``` API
* Twitter Bootstrap compatible markup
* Works perfectly together with [angular-paginate-anything](https://github.com/begriffs/angular-paginate-anything) (use ```ng-model``` as ```url-params```)

### Directive Attributes

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>ng-model</td>
      <td>Search parameters as object that could be used as <i>params</i> with Angular's <i>$http</i> API.</td>
    </tr>
    <tr>
      <td>parameters</td>
      <td>List of available parameters to search for.</td>
    </tr>
    <tr>
      <td>parametersDisplayLimit</td>
      <td>Maximum number of suggested parameters to display. Default is 8.</td>
    </tr>
    <tr>
      <td>parametersLabel</td>
      <td>Text for the suggested parameters label, e.g. "Parameter Suggestions".</td>
    </tr>
    <tr>
      <td>placeholder</td>
      <td>Specifies a short hint in the search box</td>
    </tr>
    <tr>
      <td>searchThrottleTime</td>
      <td>Specifies the time in milliseconds to wait for changes in the ui until the ng-model is updated. Default is 1000ms.</td>
    </tr>
  </tbody>
</table>

### Events

The directive emits events as search parameters added (`filter-searchbox:addedSearchParam`), removed (`filter-searchbox:removedSearchParam` and `filter-searchbox:removedAllSearchParam`), enters the edit mode (`filter-searchbox:enteredEditMode`), leaves the edit mode (`filter-searchbox:leavedEditMode`) or the search model was updated (`filter-searchbox:modelUpdated`).
To catch these events do the following:

```js
$scope.$on('filter-searchbox:addedSearchParam', function (event, searchParameter) {
  ///
});

$scope.$on('filter-searchbox:removedSearchParam', function (event, searchParameter) {
  ///
});

$scope.$on('filter-searchbox:removedAllSearchParam', function (event) {
  ///
});

$scope.$on('filter-searchbox:enteredEditMode', function (event, searchParameter) {
  ///
});

$scope.$on('filter-searchbox:leavedEditMode', function (event, searchParameter) {
  ///
});

$scope.$on('filter-searchbox:modelUpdated', function (event, model) {
  ///
});
```

### Available Search Parameters Properties

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Type</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>key</td>
      <td>Unique key of the search parameter that is used for the ng-model value.</td>
      <td>string</td>
    </tr>
    <tr>
      <td>name</td>
      <td>User friendly display name of the search parameter.</td>
      <td>string</td>
    </tr>
    <tr>
      <td>placeholder</td>
      <td>Specifies a short hint in the parameter search box</td>
      <td>string</td>
    </tr>
    <tr>
      <td>allowMultiple</td>
      <td>Should multiple search parameters of the same key allowed? Output type changes to array of values. Default is false.</td>
      <td>boolean</td>
    </tr>
    <tr>
      <td>suggestedValues</td>
      <td>An array of suggested search values, e.g. ['Berlin', 'London', 'Paris']</td>
      <td>string[]</td>
    </tr>
    <tr>
      <td>restrictToSuggestedValues</td>
      <td>Should it restrict possible search values to the ones from the suggestedValues array? Default is false.</td>
      <td>boolean</td>
    </tr>
  </tbody>
</table>

Full example:

```js
$scope.availableSearchParams = [
          { key: "name", name: "Name", placeholder: "Name..." },
          { key: "city", name: "City", placeholder: "City...", restrictToSuggestedValues: true, suggestedValues: ['Berlin', 'London', 'Paris'] }
          { key: "email", name: "E-Mail", placeholder: "E-Mail...", allowMultiple: true },
        ];
```