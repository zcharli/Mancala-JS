/**
 * Created by Ziqiao Charlie Li on 2/26/2016.
 */
'use strict';

angular.module('minmaxnodefactory', [])
    .factory('MinMaxNodeFactory', function() {

        class MinMaxNode {
            constructor(state) {
                this.state = state;
            }
        }

        return {
            newNode: function(state) {
                return new MinMaxNode(state)
            }
        }
    });
