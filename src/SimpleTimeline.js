/**
* SimpleTimeline
* A JavaScript solution to control multiple
* animations from within the 'Simple' library.
* 
* Copyright (c) 2011 Noel Tibbles (noel.tibbles.ca)
* 
* Version 0.4b
* 
* usage:
* timeline = new SimpleTimeline();
* timeline.addTween(tween1, 0);
* timeline.addTween(tween2, 0);
* timeline.addTween(tween3, 2);
* timeline.start();
* 
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>
**/
(function(window, document, undefined) {
	SimpleTimeline = function(callback){
		if(!SimpleSynchro) throw "The SimpleSynchro.js script is required to run SimpleTimeline";
	
		this._tweens = [];
		this._tweenGroup = [];
		this._curTween = null;
		this._sec = -1;
		this._startTime = 0;
		this._totalTime = 0;
		this._callback = callback || null;
		
		/**
		 * @private
		 * _add
		 * Adds a tween at the specified array index
		 * that's referenced by seconds. If no time is passed,
		 * then the tween time is used.
		 * Example: A tween to start at 3.25 gets inserted
		 * at the index of 3
		 * @param {SimpleTween} tween - the tween to add
		 * @param {Number} time - the time at which to call the tween
		 */
		this._add = function(tween, time) {
			//console.log("_add: ",tween);
			var index = (time !== undefined) ? Math.floor(time) : Math.floor(this._totalTime);
			tween.isPaused = true;
			tween.time = (time !== undefined) ? time : this._totalTime;
			this._totalTime += tween._duration;
			this._tweens[index] = this._tweens[index] || [];
			this._tweens[index].push(tween);
			this._tweens[index].sort(this._sortTime);
		};
		
		/**
		 * @private
		 * _sortTime
		 * Sorts the _tweens array by time
		 */
		this._sortTime = function(a,b) {
			return a.time-b.time;
		};
		
		/**
		 * _getTweenGroup
		 * @param (Number) sec - the second (array index) the gets the tweens from
		 * @returns The array of tweens at the specified time
		 */
		this._getTweenGroup = function(sec) {
			return this._tweens[sec] || null;
		};
	
	};
	
	SimpleTimeline.VERSION = "0.4b";
	
	var SimpleSynchro = window.SimpleSynchro,
		p = SimpleTimeline.prototype;
		p.callback = null;
		p.isPlaying = false;
	
	/**
	 * tick
	 * The main method called from SimpleSynchro.
	 * Pulls the _tweenGroup for the current second and 
	 * loops through them, comparing the current time
	 * against the tween time.
	 * If all the tweens are started, call the callback
	 * @param {Number} elapsed - the time elapsed (passed from SimpleSynchro)
	 */
	p.tick = function(elapsed) {
		var curTime = elapsed - this._startTime,
			curSec = Math.floor(curTime);
		
		if(this._sec != curSec) {
			this._tweenGroup = this._getTweenGroup(curSec);
		};
		
		if(this._tweenGroup) {
			for(var i = 0, len = this._tweenGroup.length; i < len; i++){
				this._curTween = this._tweenGroup[i];
			
				if(!this._curTween.isPlaying && !this._curTween.isComplete && curTime > this._curTween.time || 
					(curTime > this._curTween.time && this._curTween.isPaused)) {
						this._curTween.start();
				} 
			}
		};
		
		if(curSec >= this._tweens.length && curTime > this._curTween.time && !this._curTween.isPlaying) {
			if(this._callback) this._callback.call(this);
		
			SimpleSynchro.removeListener(this);
			this.isPlaying = false;
		};

		this._sec = curSec;
	};
	
	/**
	 * addTween
	 * Adds a tween to the timeline at the specified time.
	 * @param {SimpleTween} tween - the tween to add
	 * @param {Number} time - the time at which to call the tween
	 */
	p.addTween = function(tween, time) {
		this._add(tween, time);
	};

	/**
	 * start
	 * Starts the timeline
	 */
	p.start = function() {
		if(!this.isPlaying) {
			this.isPlaying = true;
			this._startTime = SimpleSynchro.getTime();
			SimpleSynchro.addListener(this);
		}
	};
	
	/**
	 * toString
	 * @returns {String} The name of the object - SimpleTimeline
	 */
	p.toString = function() {
		return "[object SimpleTimeline]";
	};
	
	window.SimpleTimeline = SimpleTimeline;
}(window, document, undefined))
