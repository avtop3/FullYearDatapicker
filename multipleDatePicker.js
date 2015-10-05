/*
 Creator: Maelig GOHIN For ARCA-Computing - www.arca-computing.fr
 Creation date: July 2014
 Version: 1.2.0
 
 Description:  MultipleDatePicker is an Angular directive to show a simple calendar allowing user to select multiple dates.
 Css style can be changed by editing less or css stylesheet.
 See scope declaration below for options you can pass through html directive.
 Feel free to edit and share this piece of code, our idea is to keep it simple ;)
 */
angular.module('multipleDatePicker', [])
        .directive('multipleDatePicker', ['$log', function ($log) {
                "use strict";
                return {
                    restrict: 'AE',
                    scope: {
                        /*
                         * DEPRECATED : use dayClick
                         * Type: function(timestamp, boolean)
                         * Will be called when un/select a date
                         * Param timestamp will be the date at midnight
                         * */
                        callback: '&',
                        dayClick: '=?',
                        dayHover: '=?',
                        /*
                         * Type: function(newMonth, oldMonth)
                         * Will be called when month changed
                         * Param newMonth/oldMonth will be the first day of month at midnight
                         * */
                        monthChanged: '=?',
                        /*
                         * Type: array of milliseconds timestamps
                         * Days already selected
                         * */
                        daysSelected: '=?',
                        /*
                         * Type: array of integers
                         * Recurrent week days not selectables
                         * /!\ Sunday = 0, Monday = 1 ... Saturday = 6
                         * */
                        weekDaysOff: '=?',
                        /*
                         * DEPRECATED : use highlightDays
                         * Type: array of milliseconds timestamps
                         * Days not selectables
                         * */
                        daysOff: '=?',
                        /*
                         * Type: array of objects cf doc
                         * Days highlights
                         * */
                        highlightDays: '=?',
                        /*
                         * Type: boolean
                         * Set all days off
                         * */
                        allDaysOff: '=?',
                        /*
                         * Type: boolean
                         * Sunday be the first day of week, default will be Monday
                         * */
                        sundayFirstDay: '=?',
                        /*
                         * Type: boolean
                         * if true can't go back in months before today's month
                         * */
                        disallowBackPastMonths: '=',
                        /*
                         * Type: boolean
                         * if true can't go in futur months after today's month
                         * */
                        disallowGoFuturMonths: '=',
                        /*
                         * Type: number in range of [1-12]
                         * What month shold show initialy
                         * */
                        initMonth: '=',
                        ngModel: '=',
                    },
                    template: '<div class="multiple-date-picker">' +
                            '<div class="picker-top-row">' +
                            '<div class="text-center picker-month">{{month.format(\'MMMM YYYY\')}}</div>' +
                            '</div>' +
                            '<div class="picker-days-week-row">' +
                            '<div class="text-center" ng-repeat="day in daysOfWeek">{{day}}</div>' +
                            '</div>' +
                            '<div class="picker-days-row">' +
                            '<div class="text-center picker-day picker-empty" ng-repeat="x in emptyFirstDays">&nbsp;</div>' +
                            '<div class="text-center picker-day {{day.css}}" title="{{day.title}}" ng-repeat="day in days" ng-click="toggleDay($event, day)"  ng-class="{\'picker-selected\':ngModel[+day.valueOf()], \'picker-off\':!day.selectable, \'today\':day.today}">{{day ? day.format(\'D\') : \'\'}}</div>' +
                            '<div class="text-center picker-day picker-empty" ng-repeat="x in emptyLastDays">&nbsp;</div>' +
                            '</div>' +
                            '</div>',
                    link: function (scope) {

                        /*utility functions*/
                        if(scope.initMonth < 1 || scope.initMonth > 12){
                            console.error('Month id is not in range 1-12!, So it inited to 1!');
                            scope.initMonth = 1;
                        }
                        var checkNavigationButtons = function () {
                            var today = moment(scope.initMonth, 'MM');
                        },
                                getDaysOfWeek = function () {
                                    /*To display days of week names in moment.lang*/
                                    var momentDaysOfWeek = moment().localeData()._weekdaysMin,
                                            days = [];
                                    for (var i = 1; i < 7; i++) {
                                        days.push(momentDaysOfWeek[i]);
                                    }

                                    if (scope.sundayFirstDay) {
                                        days.splice(0, 0, momentDaysOfWeek[0]);
                                    } else {
                                        days.push(momentDaysOfWeek[0]);
                                    }

                                    return days;
                                };

                        /*scope functions*/
                        scope.$watch('daysSelected', function (newValue) {
                            if (newValue) {
                                var momentDates = [];
                                newValue.map(function (timestamp) {
                                    momentDates.push(moment(timestamp));
                                });
                                scope.convertedDaysSelected = momentDates;
                                scope.generate();
                            }
                        }, true);

                        scope.$watch('weekDaysOff', function () {
                            scope.generate();
                        }, true);

                        scope.$watch('daysOff', function (value) {
//                    if (value !== undefined) {
//                        $log.warn('daysOff option deprecated since version 1.1.6, please use highlightDays');
//                    }
                            scope.generate();
                        }, true);

                        scope.$watch('highlightDays', function () {
                            scope.generate();
                        }, true);

                        scope.$watch('allDaysOff', function () {
                            scope.generate();
                        }, true);

                        //default values
                        scope.month = scope.month || moment(scope.initMonth, 'MM').startOf('day');
                        scope.days = [];
                        scope.convertedDaysSelected = scope.convertedDaysSelected || [];
                        scope.weekDaysOff = scope.weekDaysOff || [];
                        scope.daysOff = scope.daysOff || [];
                        scope.disableBackButton = true;
                        scope.disableNextButton = true;
                        scope.daysOfWeek = getDaysOfWeek();

                        /**
                         * Called when user clicks a date
                         * @param Event event the click event
                         * @param Moment momentDate a moment object extended with selected and isSelectable booleans
                         * @see #momentDate
                         * @callback dayClick
                         * @callback callback deprecated
                         */
                        scope.toggleDay = function (event, momentDate) {
                            event.preventDefault();

                            var prevented = false;

                            event.preventDefault = function () {
                                prevented = true;
                            };

                            if (typeof scope.dayClick == 'function') {
                                scope.dayClick(event, momentDate);
                            }

                            if (momentDate.selectable && !prevented) {
                                momentDate.selected = !momentDate.selected;
                                if (scope.ngModel[momentDate.valueOf()]) {
                                    delete scope.ngModel[momentDate.valueOf()];
                                } else {
                                    scope.ngModel[momentDate.valueOf()] = momentDate.valueOf();
                                }

                                if (momentDate.selected) {
                                    scope.convertedDaysSelected.push(momentDate);
                                } else {
                                    scope.convertedDaysSelected = scope.convertedDaysSelected.filter(function (date) {
                                        return date.valueOf() !== momentDate.valueOf();
                                    });
                                }

                                if (typeof (scope.callback) === "function") {
                                    $log.warn('callback option deprecated, please use dayClick');
                                    scope.callback({timestamp: momentDate.valueOf(), selected: momentDate.selected});
                                }
                            }
                        };

                        /*Check if the date is off : unselectable*/
                        scope.isDayOff = function (scope, date) {
                            return scope.allDaysOff ||
                                    (angular.isArray(scope.weekDaysOff) && scope.weekDaysOff.some(function (dayOff) {
                                        return date.day() === dayOff;
                                    })) ||
                                    (angular.isArray(scope.daysOff) && scope.daysOff.some(function (dayOff) {
                                        return date.isSame(dayOff, 'day');
                                    })) ||
                                    (angular.isArray(scope.highlightDays) && scope.highlightDays.some(function (highlightDay) {
                                        return date.isSame(highlightDay.date, 'day') && !highlightDay.selectable;
                                    }));
                        };

                        /*Check if the date is selected*/
                        scope.isSelected = function (scope, date) {
                            return scope.convertedDaysSelected.some(function (d) {
                                return date.isSame(d, 'day');
                            });
                        };

                        /*Generate the calendar*/
                        scope.generate = function () {
                            var previousDay = moment(scope.month).date(0),
                                    firstDayOfMonth = moment(scope.month).date(1),
                                    days = [],
                                    now = moment(),
                                    lastDayOfMonth = moment(firstDayOfMonth).endOf('month'),
                                    maxDays = lastDayOfMonth.date();

                            var createDate = function () {
                                var date = moment(previousDay.add(1, 'days'));
                                if (angular.isArray(scope.highlightDays)) {
                                    var hlDay = scope.highlightDays.filter(function (d) {
                                        return date.isSame(d.date, 'day');
                                    });
                                    date.css = hlDay.length > 0 ? hlDay[0].css : '';
                                    date.title = hlDay.length > 0 ? hlDay[0].title : '';
                                }
                                date.selectable = !scope.isDayOff(scope, date);
                                date.selected = scope.isSelected(scope, date);
                                date.today = date.isSame(now, 'day');
                                return date;
                            };

                            scope.emptyFirstDays = [];

                            var emptyFirstDaysStartIndex;
                            if (firstDayOfMonth.day() === 0) {
                                emptyFirstDaysStartIndex = scope.sundayFirstDay ? 0 : 6;
                            } else {
                                emptyFirstDaysStartIndex = firstDayOfMonth.day() - (scope.sundayFirstDay ? 0 : 1);
                            }
                            for (var i = emptyFirstDaysStartIndex; i > 0; i--) {
                                scope.emptyFirstDays.push({});
                            }

                            for (var j = 0; j < maxDays; j++) {
                                days.push(createDate());
                            }

                            scope.emptyLastDays = [];
                            var emptyLastDaysStartIndex = scope.sundayFirstDay ? 6 : 7;
                            if (lastDayOfMonth.day() === 0 && !scope.sundayFirstDay) {
                                emptyLastDaysStartIndex = 0;
                            } else {
                                emptyLastDaysStartIndex -= lastDayOfMonth.day();
                            }
                            for (var k = emptyLastDaysStartIndex; k > 0; k--) {
                                scope.emptyLastDays.push({});
                            }
                            scope.days = days;
                            checkNavigationButtons();
                        };

                        scope.generate();
                    }
                };
            }]);
