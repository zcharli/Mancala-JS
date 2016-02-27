/**
 * Created by Ziqiao Charlie Li on 2/26/2016.
 */
'use strict';
angular.module('playerfactory', [])
    .factory('PlayerFactory', function() {
        let PlayerType = {
            RED: 0,
            BLUE: 1,
            valueToEnum: {
                0: "RED",
                1: "BLUE"
            }
        };
        class Player {
            constructor(playerNum) {
                this.playerType = PlayerType[playerNum];
            }
        }
        return {
            newPlayer: function(playerNum) {
                return new Player(PlayerType.valueToEnum[playerNum]);
            },
            PlayerType
        }
    });