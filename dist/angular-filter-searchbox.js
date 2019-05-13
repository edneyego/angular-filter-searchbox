/*!
 * angular-filter-searchbox
 * https://github.com/edneyego/angular-filter-searchbox
 * Copyright (c) 2016 Nauck IT KG http://www.nauck-it.de/
 * Author: Edney Oliveira <edneyego@gmail.com>
 * License: MIT
 */
(function() {

    'use strict';
    
    angular.module('angular-filter-searchbox', [])
        .directive('nitFilterSearchbox', function() {
            return {
                restrict: 'E',
                scope: {
                    model: '=ngModel',
                    parameters: '=',
                    defaultparams: '=',
                    filters: '=',
                    enter: '=',
                    save: '=',
                    selectedFilter: '=',
                    placeholder: '@'
                },
                replace: true,
                templateUrl: function(element, attr) {
                    return  attr.templateUrl || 'angular-filter-searchbox.html';
                },
                controller: [
                    '$scope', '$attrs', '$element', '$timeout', '$filter',
                    function ($scope, $attrs, $element, $timeout, $filter) {
    
                        $scope.placeholder = $scope.placeholder || 'Search ...';
                        $scope.searchParams = [];
                        $scope.conditions = [
                            {
                                "key": "=",
                                "value": "igual",
                                "restrict":[]
                            },
                            {
                                "key": "> <",
                                "value": "entre",
                                "restrict":['date','number','floating','list']
                            },
                            {
                                "key": ">",
                                "value": "maior_que",
                                "restrict":['text','list']
                            },
                            {
                                "key": ">=",
                                "value": "maior_igual",
                                "restrict":['text','list']
                            },
                            {
                                "key": "<",
                                "value": "menor_que",
                                "restrict":['text','list']
                            },
                            {
                                "key": "<=",
                                "value": "menor_igual",
                                "restrict":['text','list']
                            },
                            {
                                "key": "< >",
                                "value": "diferente",
                                "restrict":[]
                            }
                        ];
                        $scope.selectedConditional = 'igual';
                        $scope.searchQuery = '';
                        $scope.setSearchFocus = false;
                        $scope.Enter = $scope.enter;
                        $scope.Save = $scope.save;
                        $scope.SelectedFilter = $scope.selectedFilter;
                        var searchThrottleTimer;
                        var changeBuffer = [];
                        if ($scope.defaultparams) {
                           if (!$scope.defaultparams.query) {
                              /*$scope.defaultparams.query = '';*/
                           }
                        } else {
                            $scope.defaultparams = {};
                        }
                        $scope.model = angular.copy($scope.defaultparams);
    
                        $scope.$watch('defaultparams', function () {
                           $scope.model = angular.copy($scope.defaultparams);
                        });
    
                        $scope.$watch('model', function (newValue, oldValue) {
                            if(angular.equals(newValue, oldValue))
                                return;
    
                            angular.forEach($scope.model, function (value, key) {
                                if (key === 'query' && $scope.searchQuery !== value) {
                                    /*$scope.searchQuery = value;*/
                                } else {
                                    var paramTemplate = $filter('filter')($scope.parameters, function (param) { return param.key === key; })[0];
                                    var searchParam = $filter('filter')($scope.searchParams, function (param) { return param.key === key; })[0];
    
                                    if (paramTemplate !== undefined) {
                                        if(searchParam === undefined)
                                            $scope.addSearchParam(paramTemplate, value, false);
                                        else if (searchParam.value !== value )
                                            searchParam.value = value;
                                    }
                                }
                            });
    
                            angular.forEach($scope.searchParams, function (value, key){
                                if (!$scope.model.hasOwnProperty(value.key)){
                                    var index = $scope.searchParams.map(function(e) { return e.key; }).indexOf(value.key);
                                    $scope.removeSearchParam(index);
                                }
                            });
                        }, true);
    
                        $scope.isDefault = function () {
                            return angular.equals($scope.defaultparams, $scope.model);
                        };
                        $scope.idxOfList = function (Arr, elm) {
                            var ret = Arr.indexOf(elm);
                            if (ret >= 0 ) {
                               return ret;
                            } else { 
                               ret = 0;
                               for (var k in Arr){
                                  if (angular.equals(elm,Arr[k]))  {
                                     return ret;
                                  }
                                  ret += 1;
                               }
                               return -1;
                            }
                        };
                        $scope.searchParamValueChanged = function (param) {
                            updateModel('change', param.key, param.value);
                        };
    
                        $scope.searchQueryChanged = function (query) {
                            /*updateModel('change', 'query', query);*/
                        };
    
                        $scope.enterEditMode = function(index,key) {
                            if (index === undefined)
                                return;
    
                            var searchParam = $scope.searchParams[index];
                            searchParam.editMode = true;
                            searchParam.inpFocus = key;
                            $scope.focus = true; 
                        };
    
                        $scope.focusEditMode = function(editMode,parentIndex,index) {
                            if (index === undefined)
                                return;
    
                            var searchParam = $scope.searchParams[parentIndex];
                            if (searchParam.editMode && searchParam.indexEdit ==index)
                                return true;
                            else
                                return false;
                        };
    
                        $scope.leaveEditMode = function(index) {
                            if (index === undefined)
                                return;
    
                            var searchParam = $scope.searchParams[index];
                            searchParam.editMode = false;
    
                            if (!searchParam.value)
                                $scope.removeSearchParam(index);
                        };
    
                        $scope.typeaheadOnSelect = function (item, model, label) {
                            $scope.addSearchParam(item);
                            $scope.searchQuery = '';
                            /*updateModel('delete', 'query');*/
                        };
    
                        $scope.isUnsedParameter = function (value) {
                            return $filter('filter')($scope.searchParams, function (param) { return param.key === value.key; }).length === 0;
                        };
    
                        $scope.addNewSearchParam = function (key) {
                            if ($scope.model[key]=== undefined)
                                return;
    
                            var values =$scope.model[key];
                            if (values === undefined){
                               values = []; 
                            }
                            if (values.length<=1){
                                values.push({value:'',cond:'igual'});
    
                                updateModel('add', searchParam.key, values);
                            }
                            
                        };
    
                        $scope.addSearchParam = function (searchParam, value, enterEditModel) {
                            if (enterEditModel === undefined)
                                enterEditModel = true;
    
                            if (!$scope.isUnsedParameter(searchParam))
                                return;
                    
                            var conditions = ["list", "number", "date"];
                            var cond = "entre";
                            for (var i = 0; i < conditions.length; i++) {
                                if (searchParam.type==conditions[i]){
                                    cond = "igual";
                                    break;
                                }
                            }
                            
                            $scope.searchParams.push(
                                {
                                    key: searchParam.key,
                                    name: searchParam.name,
                                    placeholder: searchParam.placeholder,
                                    type: searchParam.type,
                                    options : searchParam.options,
                                    required:searchParam.required,
                                    value: value || [{value:'',cond:cond}],
                                    editMode: enterEditModel,
                                    inpFocus:0
                                }
                            );
                            if (value === undefined) {
                               $timeout( function(){
                                  $scope.focus = true;
                               });
                            }
                            updateModel('add', searchParam.key, value);
                        };
    
                        $scope.removeSearchParam = function (index) {
                            if (index === undefined)
                                return;
    
                            var searchParam = $scope.searchParams[index];
                            if (searchParam.required) return;
                            $scope.searchParams.splice(index, 1);
    
                            updateModel('delete', searchParam.key,index);
                        };
                      
                        $scope.clearSearch = function() {
                            $scope.searchParams = [];
                        };
                      
                        $scope.removeAll = function() {
                            $scope.searchParams = [];
                            $scope.searchParams.length = 0;
                            $scope.searchQuery = '';
    
                            $scope.defaultparams = {};
                            $scope.filter = {};
                            
                            $scope.model = {};
                            $scope.model= angular.copy($scope.defaultparams);
                            $scope.focus = false;
                        };
    
                        $scope.removeFilter = function() {
                            $scope.searchParams = [];
                            $scope.filter = {};
                        };
    
                        $scope.editPrevious = function(currentIndex) {
                            if (currentIndex === undefined && $scope.searchParams.length > 0) {
                                $scope.enterEditMode($scope.searchParams.length - 1);
                            } else if (currentIndex > 0) {
                                $scope.enterEditMode(currentIndex - 1);
                            } else if ($scope.searchParams.length > 0) {
                                $scope.setSearchFocus = true;
                            }
                        };
    
                        $scope.editNext = function(currentIndex) {
                            if (currentIndex === undefined) {
                                return;
                            }
    
                            $scope.leaveEditMode(currentIndex);
    
                            if (currentIndex < $scope.searchParams.length - 1) {
                                $scope.enterEditMode(currentIndex + 1);
                            } else {
                                $scope.setSearchFocus = true;
                            }
                        };
    
                        $scope.keydown = function(e, searchParamIndex) {
                            var handledKeys = [9, 13];
                            if (handledKeys.indexOf(e.which) === -1)
                                return;
                            var notSupportType;
                            var cursorPosition;
                            try{
                               notSupportType  = false;
                               cursorPosition = getCurrentCaretPosition(e.target);
                            } catch(err) {
                               notSupportType = true; 
                            }
    
                            if (e.which == 9) {
                                if (e.shiftKey) {
                                    e.preventDefault();
                                    $scope.editPrevious(searchParamIndex);
                                } else {
                                    e.preventDefault();
                                    $scope.editNext(searchParamIndex);
                                }
    
                            } else if (e.which == 13) {
                                $scope.editNext(searchParamIndex);
    
                            }
                        };
    
                        function restoreModel() {
                            angular.forEach($scope.model, function (value, key) {
                                if (key === 'query') {
                                    /*$scope.searchQuery = value;*/
                                } else {
                                    var searchParam = $filter('filter')($scope.parameters, function (param) { return param.key === key; })[0];
                                    if (searchParam !== undefined)
                                        $scope.addSearchParam(searchParam, value, false);
                                }
                            });
                        }
    
                        if ($scope.model === undefined) {
                            $scope.model = {};
                        } else {
                            restoreModel();
                        }
    
                        function updateModel(command, key, value) {
                            if (searchThrottleTimer)
                                $timeout.cancel(searchThrottleTimer);
    
                            changeBuffer = $filter('filter')(changeBuffer, function (change) { return change.key !== key; });
       
                            changeBuffer.push({
                                command: command,
                                key: key,
                                value: value
                            });
    
                            searchThrottleTimer = $timeout(function () {
                                angular.forEach(changeBuffer, function (change) {
                                    if(change.command === 'delete')
                                        delete $scope.model[change.key];
                                    else 
                                        $scope.model[change.key] = change.value;
                                });
    
                                changeBuffer.length = 0;
                            }, 500);
                        }
    
                        function getCurrentCaretPosition(input) {
                            if (!input)
                                return 0;
    
                            if (typeof input.selectionStart === 'number') {
                                return input.selectionDirection === 'backward' ? input.selectionStart : input.selectionEnd;
    
                            } else if (document.selection) {
                                input.focus();
                                var selection = document.selection.createRange();
                                var selectionLength = document.selection.createRange().text.length;
                                selection.moveStart('character', -input.value.length);
                                return selection.text.length - selectionLength;
                            }
    
                            return 0;
                        }
                    }
                ]
            };
        })
        .directive('nitSetFocus', [
            '$timeout', '$parse',
            function($timeout, $parse) {
                return {
                    restrict: 'A',
                    link: function($scope, $element, $attrs) {
                        var model = $parse($attrs.nitSetFocus);
                        $scope.$watch(model, function(value) {
                            if (value === true) {
                                $timeout(function() {
                                    $element[0].focus();
                                });
                            }
                        });
                        $element.bind('blur', function() {
                           try {
                               if ($attrs.name != 'searchbox') {
                                  var index = $scope.searchParams.length-1;
                                  var searchParam= $scope.searchParams[$scope.searchParams.length-1];
                                   angular.forEach($scope.searchParams, function (param){
                                        param.editMode=false;
                                        
                                    });
    
                                  if (!searchParam.value)
                                     $scope.removeSearchParam(index);
                               }
                           } catch (e) {}
    
                            /*$scope.$apply(model.assign($scope, false));*/
                        });
                    }
                };
            }
        ])
        .directive('nitAutoSizeInput', [
            function() {
                return {
                    restrict: 'A',
                    scope: {
                        model: '=ngModel'
                    },
                    link: function($scope, $element, $attrs) {
                        var container = angular.element('<div style="position: fixed; top: -9999px; left: 0px;"></div>');
                        var shadow = angular.element('<span style="white-space:pre;"></span>');
    
                        var maxWidth = $element.css('maxWidth') === 'none' ? $element.parent().innerWidth() : $element.css('maxWidth');
                        $element.css('maxWidth', maxWidth);
    
                        angular.forEach([
                            'fontSize', 'fontFamily', 'fontWeight', 'fontStyle',
                            'letterSpacing', 'textTransform', 'wordSpacing', 'textIndent',
                            'boxSizing', 'borderLeftWidth', 'borderRightWidth', 'borderLeftStyle', 'borderRightStyle',
                            'paddingLeft', 'paddingRight', 'marginLeft', 'marginRight'
                        ], function(css) {
                            shadow.css(css, $element.css(css));
                        });
    
                        angular.element('body').append(container.append(shadow));
    
                        function resize() {
                            shadow.text($element.val() || $element.attr('placeholder'));
                            $element.css('width', shadow.outerWidth() + 25);
                $element.css('paddingLeft', 5);
                        }
    
                        resize();
    
                        if ($scope.model) {
                            $scope.$watch('model', function() { resize(); });
                        } else {
                            $element.on('keypress keyup keydown focus input propertychange change', function() { resize(); });
                        }
                    }
                };
            }
        ]).filter('dateUTC', function ($filter) {
           return function (input, format) {
               if (!angular.isDefined(format)) {
                   format = 'dd/MM/yyyy';
               }
               var date = new Date(input);
               return $filter('date')(date.toISOString().slice(0, 23), format);
           };
        });
    })();
    


