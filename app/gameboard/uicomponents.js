'use-strict';

var app = angular.module('uiComponents', ['ngSanitize']);

// registers native Twitter Bootstrap tooltips
app.directive('toolTip', function () {
    return function (scope, element, attrs) {
        attrs.$observe('title', function (title) {
            // Destroy any existing tooltips (otherwise new ones won't get initialized)
            element.tooltip('destroy');
            // Only initialize the tooltip if there's text (prevents empty tooltips)
            if (jQuery.trim(title)) element.tooltip();
        });
        element.on('$destroy', function () {
            element.tooltip('destroy');
            delete attrs.$$observers['title'];
        });
    };
});
app.directive('movePopover', ["$popover", "$compile", "$timeout", function ($popover, $compile, $timeout) {
    return {
        restrict: "EAC",
        //scope: {getGameUIStates: "&"},
        template: function (element, attrs) {
            var attributes = attrs["movePopover"].split(" ");
            console.log(element)
            if (attributes[3] == "blue") {
                var id = "blue-" + attributes[0];
                console.log(id)
                var changedtext = attributes[4];
                console.log(changedtext);
                return "<div class='pop-over-move circle blue-fill' id='" + id + "' change-amount='"+id+" "+changedtext+"'> {{ballsInHole}}</div>";
            } else {
                var id = "red-" + attributes[0];
                var changedtext = attributes[4];
                console.log(changedtext);
                return "<div class='pop-over-move circle red-fill' id='" + id + "' change-amount='"+id+" "+changedtext+"'> {{ballsInHole}}</div>";
            }
        },
        link: function (scope, element, attrs) {
            var index = attrs["movePopover"].split(" ");
            $(".pop-over-move").popover({
                content: function () {
                    return $compile("<div class='selector-of-move'><button class='move-choice btn' data-ng-click='cellClicked(" + index[2] + ", " + index[0] + ",0);removePopup()'>&larr;</button>" +
                        "<button class='move-choice btn' data-ng-click='cellClicked(" + index[2] + ", " + index[0] + ",1);removePopup()' >&rarr;</button></div>")(scope)
                },
                html: true,
                trigger: 'click',
                autoClose: false,
                scope: scope,
                animation: 'am-flip-x',
                placement: index[1],
            });

            var _hide = function () {
                var pops = $(".popover");
                pops.fadeOut(500, function () {
                    $(this).remove();
                });
            };

            // Stop propagation when clicking inside popover.
            element.on("click", function (event) {
                event.stopPropagation();
            });
            $timeout(function () {
                angular.element("html").bind("click", _hide);
            }, 0);
            // Safe remove.
            scope.$on("$destroy", function () {
                angular.element("html").off("click", _hide);
            });
            scope.removePopup = function () {
                _hide();
            }
        }
    };
}]);

app.directive('changeAmount', ['$tooltip', '$timeout','$compile', function ($tooltip, $timeout, $compile) {
    return {
        restrict: 'A',
        //scope: {tooltip:"&"},
        transclude: false,
        link: function (scope, element, attrs) {
            //var e = angular.element(document.getElementById("#rs-r"));
            //console.log(attrs);
            var params = attrs["changeAmount"].split(" ");
            var id = params[0];
            var changed = params[1];
            var placement = "";
            if(id.indexOf("blue") > -1) {
                placement = "top";
            } else {
                placement = "bottom";
            }
            console.log(changed)
            $timeout(function () {
                var target = $("#" + id);
                //var changedText = $compile(changed);
                var changedText = "" + changed;
                var myTooltip = $tooltip(target,
                    { title:changedText, trigger:'manual', placement:placement, container:"",animation: 'am-flip-x',}
                );
                myTooltip.$promise.then(function () {
                    myTooltip.show();
                });

                $timeout(function () {
                    myTooltip.$promise.then(function () {
                        myTooltip.hide();
                    });
                }, 2000);
            }, 500);
        }
    };
}]);