# FullYearDatapicker
Allow you to build 12-month, or n-month calendar with posibility multiple date seelction

How to use:

    <div class='col-lg-2 col-md-3  multiple-date-picker-wraper' ng-repeat="monthIndex in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]">
                        <multiple-date-picker 
                            init-month="monthIndex"
                            ng-model="modelHelper.schedule"
                            />
                    </div
