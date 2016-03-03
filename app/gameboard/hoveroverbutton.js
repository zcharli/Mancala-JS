var app = angular.module('uiComponents',[]);

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
