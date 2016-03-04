var app = angular.module('uiComponents',['ngSanitize']);

// registers native Twitter Bootstrap tooltips
app.directive('toolTip', function() {
    return function(scope, element, attrs) {
        attrs.$observe('title',function(title){
            // Destroy any existing tooltips (otherwise new ones won't get initialized)
            element.tooltip('destroy');
            // Only initialize the tooltip if there's text (prevents empty tooltips)
            if (jQuery.trim(title)) element.tooltip();
        });
        element.on('$destroy', function() {
            element.tooltip('destroy');
            delete attrs.$$observers['title'];
        });
    };
});
app.directive('movePopover', ["$popover", "$compile","$timeout", function($popover, $compile, $timeout){
    return {
        restrict: "EAC",
        template: "<div class='pop-over-move circle blue-fill'> {{ballsInHole}}</div>",
        link: function(scope, element, attrs) {
            //console.log(scope.getGameUIStates.playerTurn)
            var index = attrs["movePopover"].split(" ");
            $(".pop-over-move").popover({
                //title: 'Choose:',
                content: function (){
                    return $compile("<div class='selector-of-move'><button class='move-choice btn' data-ng-click='cellClicked("+index[2]+", "+index[0]+",0);removePopup()'>&larr;</button>"+
                "<button class='move-choice btn' data-ng-click='cellClicked("+index[2]+", "+index[0]+",1);removePopup()' >&rarr;</button></div>")(scope)
                },
                html: true,
                trigger: 'click',
                autoClose: false,
                scope: scope,
                animation: 'am-flip-x',
                placement:index[1],
            });

            var _hide = function () {
                var pops = $(".popover")
                pops.fadeOut(500, function() {
                    $( this ).remove();
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
            scope.removePopup = function(){
                _hide();
            }
        }
    };
}]);

app.directive("popoverHtmlUnsafePopup", function () {
    return {
        restrict: "EA",
        replace: true,
        scope: { title: "@", content: "@", placement: "@", animation: "&", isOpen: "&" },
        templateUrl: "popover-html-unsafe-popup.html"
    };
})

.directive("popoverHtmlUnsafe", [ "$tooltip", function ($tooltip) {
    return $tooltip("popoverHtmlUnsafe", "popover", "click");
}]);
