/*
*
* mads - version 2.00.01
* Copyright (c) 2015, Ninjoe
* Dual licensed under the MIT or GPL Version 2 licenses.
* https://en.wikipedia.org/wiki/MIT_License
* https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
*
*/
var mads = function (options) {

  var _this = this;

  this.render = options.render;

  /* Body Tag */
  this.bodyTag = document.getElementsByTagName('body')[0];

  /* Head Tag */
  this.headTag = document.getElementsByTagName('head')[0];

  /* json */
  if (typeof json == 'undefined' && typeof rma != 'undefined') {
    this.json = rma.customize.json;
  } else if (typeof json != 'undefined') {
    this.json = json;
  } else {
    this.json = '';
  }

  /* fet */
  if (typeof fet == 'undefined' && typeof rma != 'undefined') {
    this.fet = typeof rma.fet == 'string' ? [rma.fet] : rma.fet;
  } else if (typeof fet != 'undefined') {
    this.fet = fet;
  } else {
    this.fet = [];
  }

  this.fetTracked = false;

  /* load json for assets */
  this.loadJs(this.json, function () {
    _this.data = json_data;

    _this.render.render();
  });

  /* Get Tracker */
  if (typeof custTracker == 'undefined' && typeof rma != 'undefined') {
    this.custTracker = rma.customize.custTracker;
  } else if (typeof custTracker != 'undefined') {
    this.custTracker = custTracker;
  } else {
    this.custTracker = [];
  }

  /* CT */
  if (typeof ct == 'undefined' && typeof rma != 'undefined') {
    this.ct = rma.ct;
  } else if (typeof ct != 'undefined') {
    this.ct = ct;
  } else {
    this.ct = [];
  }

  /* CTE */
  if (typeof cte == 'undefined' && typeof rma != 'undefined') {
    this.cte = rma.cte;
  } else if (typeof cte != 'undefined') {
    this.cte = cte;
  } else {
    this.cte = [];
  }

  /* tags */
  if (typeof tags == 'undefined' && typeof tags != 'undefined') {
    this.tags = this.tagsProcess(rma.tags);
  } else if (typeof tags != 'undefined') {
    this.tags = this.tagsProcess(tags);
  } else {
    this.tags = '';
  }

  /* Unique ID on each initialise */
  this.id = this.uniqId();

  /* Tracked tracker */
  this.tracked = [];
  /* each engagement type should be track for only once and also the first tracker only */
  this.trackedEngagementType = [];
  /* trackers which should not have engagement type */
  this.engagementTypeExlude = [];
  /* first engagement */
  this.firstEngagementTracked = false;

  /* RMA Widget - Content Area */
  this.contentTag = document.getElementById('rma-widget');

  /* URL Path */
  this.path = typeof rma != 'undefined' ? rma.customize.src : '';

  /* Solve {2} issues */
  for (var i = 0; i < this.custTracker.length; i++) {
    if (this.custTracker[i].indexOf('{2}') != -1) {
      this.custTracker[i] = this.custTracker[i].replace('{2}', '{{type}}');
    }
  }
};

/* Generate unique ID */
mads.prototype.uniqId = function () {

  return new Date().getTime();
}

mads.prototype.tagsProcess = function (tags) {

  var tagsStr = '';

  for(var obj in tags){
    if(tags.hasOwnProperty(obj)){
      tagsStr+= '&'+obj + '=' + tags[obj];
    }
  }

  return tagsStr;
}

/* Link Opner */
mads.prototype.linkOpener = function (url) {

  if(typeof url != "undefined" && url !=""){

    if(typeof this.ct != 'undefined' && this.ct != '') {
      url = this.ct + encodeURIComponent(url);
    }

    if (typeof mraid !== 'undefined') {
      mraid.open(url);
    }else{
      window.open(url, "_self");
    }

    if(typeof this.cte != 'undefined' && this.cte != '') {
      this.imageTracker(this.cte);
    }
  }
}

/* tracker */
mads.prototype.tracker = function (tt, type, name, value) {

  /*
  * name is used to make sure that particular tracker is tracked for only once
  * there might have the same type in different location, so it will need the name to differentiate them
  */
  name = name || type;

  if ( tt == 'E' && !this.fetTracked ) {
    for ( var i = 0; i < this.fet.length; i++ ) {
      var t = document.createElement('img');
      t.src = this.fet[i];

      t.style.display = 'none';
      this.bodyTag.appendChild(t);
    }
    this.fetTracked = true;
  }

  if ( typeof this.custTracker != 'undefined' && this.custTracker != '' && this.tracked.indexOf(name) == -1 ) {
    for (var i = 0; i < this.custTracker.length; i++) {
      var img = document.createElement('img');

      if (typeof value == 'undefined') {
        value = '';
      }

      /* Insert Macro */
      var src = this.custTracker[i].replace('{{rmatype}}', type);
      src = src.replace('{{rmavalue}}', value);

      /* Insert TT's macro */
      if (this.trackedEngagementType.indexOf(tt) != '-1' || this.engagementTypeExlude.indexOf(tt) != '-1') {
        src = src.replace('tt={{rmatt}}', '');
      } else {
        src = src.replace('{{rmatt}}', tt);
        this.trackedEngagementType.push(tt);
      }

      /* Append ty for first tracker only */
      if (!this.firstEngagementTracked && tt == 'E') {
        src = src + '&ty=E';
        this.firstEngagementTracked = true;
      }

      /* */
      img.src = src + this.tags + '&' + this.id;

      img.style.display = 'none';
      this.bodyTag.appendChild(img);

      this.tracked.push(name);
    }
  }
};

mads.prototype.imageTracker = function (url) {
  for ( var i = 0; i < url.length; i++ ) {
    var t = document.createElement('img');
    t.src = url[i];

    t.style.display = 'none';
    this.bodyTag.appendChild(t);
  }
}

/* Load JS File */
mads.prototype.loadJs = function (js, callback) {
  var script = document.createElement('script');
  script.src = js;

  if (typeof callback != 'undefined') {
    script.onload = callback;
  }

  this.headTag.appendChild(script);
}

/* Load CSS File */
mads.prototype.loadCss = function (href) {
  var link = document.createElement('link');
  link.href = href;
  link.setAttribute('type', 'text/css');
  link.setAttribute('rel', 'stylesheet');

  this.headTag.appendChild(link);
}

/*
*
* Unit Testing for mads
*
*/
var Ad = function () {
  /* pass in object for render callback */
  var self = this;

  this.app = new mads({
    'render' : this
  });

  this.onces = 0;
  this.oncelp = 0;

  self.app.loadJs(self.app.path + 'js/draggabilly.pkgd.min.js', function() {
    self.app.loadJs(self.app.path + 'js/snap.svg-min.js', function () {
      self.render();
    });
  });

}

/*
* render function
* - render will be called once json data loaded
* - render has to be done in render function
*/
Ad.prototype.render = function () {

  this.app.contentTag.innerHTML = '<div class="container" id="c"><div id="inner"><svg id="main"></svg><img style="margin-top:-5px;" src="'+this.app.path+'img/swipe-down.png"></div></div>';

  document.body.style.margin = 0;
  document.body.style.padding = 0;

  var s = this.s = Snap('#main');
  var paper = this.paper = s.paper;

  var els = {}

  els.bg1 = paper.image(this.app.path + 'img/bg01.png');
  els.bg2 = paper.image(this.app.path + 'img/bg02.png');
  els.bg2.node.style.opacity = '0';

  els.base1 = paper.image(this.app.path + 'img/base01.png');

  els.base2 = paper.image(this.app.path + 'img/base02.png', 90, 480 - 183);

  // els.teabag_c = paper.svg(0, 0, 320, 350, 0, 0, 320, 480);

  els.teabag = paper.image(this.app.path + 'img/teabag.png', 120, -180);
  // els.teabag_c.node.setAttribute('preserveAspectRatio', 'xMinYMax slice');

  els.base2top = paper.image(this.app.path + 'img/base02-top.png', 90, 480 - 160);
  els.base1top = paper.image(this.app.path + 'img/base01-top.png', 90, 480 - 155);
  els.base1top.node.style.opacity = '0';

  els.tilt = paper.image(this.app.path + 'img/tilt-icn.png', 320 - 100, 480 - 285);

  els.copy1 = paper.image(this.app.path + 'img/copy01.png', 320 / 2 - 259 / 2 , 20);
  els.copy2 = paper.image(this.app.path + 'img/copy02.png', 320 / 2 - 267 / 2, 100);
  els.copy3 = paper.image(this.app.path + 'img/copy03.png', 320 / 2 - 206 / 2, 60);
  els.copy3.node.style.opacity = '0';

  els.cta = paper.image(this.app.path + 'img/cta-swipe.png', 320 / 2 - 190 / 2, 260);
  els.cta.node.style.opacity = '0';

  els.cuptop = paper.image(this.app.path + 'img/cup-toplayer.png', 113, 343);

  this.applyStyle(this.app.contentTag);
  this.applyEvents(els);
}

Ad.prototype.applyStyle = function(e) {
  var container = e.querySelector('.container');
  container.style.width = '320px';
  container.style.height = '480px';
  container.style.overflow = 'hidden';

  var svg = e.querySelector('#main');
  svg.setAttribute('width', 320);
  svg.setAttribute('height', 480);
}

Ad.prototype.applyEvents = function(els) {
  var self = this;
  var e = this.app.contentTag;

  var inner = e.querySelector('#inner');

  function openLP() {
    if (self.oncelp === 0) {
        self.oncelp += 1;
        self.app.linkOpener('https://www.pizzahut.co.id/menu/tea-time')
    }
  }

  var originBetka;

  function deviceOrientationListener(event) {
    var betka = Math.round(event.beta);
    if(!originBetka) originBetka = betka;
    var diff = 0;
    if (betka > originBetka)
      diff = betka - originBetka;
    if (diff > 40 && self.onces === 0) {
        startAnimation();
        self.onces += 1;
    };
  }

  if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", deviceOrientationListener);
  }

  function upAndDownAnimateTeaBag() {
    els.teabag.stop().animate(
      {y: -180},
      500,
      function() {
        els.teabag.animate({y: -170}, 500, upAndDownAnimateTeaBag)
      }
    )
  }

  upAndDownAnimateTeaBag();

  function startAnimation() {
    els.teabag.stop().animate({y: -45}, 500);

    els.tilt.node.style.transition = 'opacity 0.6s';
    els.tilt.node.style.opacity = '1';
    els.tilt.node.style.opacity = '0';

    setTimeout(function() {
      els.bg1.node.style.transition = 'opacity 0.5s';
      els.bg1.node.style.opacity = '1';
      els.bg1.node.style.opacity = '0';

      els.bg2.node.style.transition = 'opacity 0.3s';
      els.bg2.node.style.opacity = '0';
      els.bg2.node.style.opacity = '1';

      var bbox = els.copy3.getBBox();

      els.copy3.transform('s0,0,' + bbox.cx + ',' + bbox.cy);
      els.copy3.animate({ transform: "s1,1," + bbox.cx + "," + bbox.cy}, 300);

      els.copy3.node.style.transition = 'opacity 0.5s';
      els.copy3.node.style.opacity = '1';

      function upAndDownAnimateCTA() {
        els.cta.stop().animate(
          {y: 255},
          300,
          function() {
            els.cta.animate({y: 265}, 300, upAndDownAnimateCTA)
          }
        )
      }

      upAndDownAnimateCTA();

      setTimeout(function() {
        els.cta.node.style.transition = 'opacity 0.5s';
        els.cta.node.style.opacity = '1';

        var draggie = new Draggabilly(inner, {
          axis: 'y'
        });

        draggie.on('dragMove', function() {
          if (draggie.position.y > 0) {
            draggie.position.y = 0;
          }

          if (draggie.position.y < -950) {
            openLP();
          }

          if (draggie.position.y < -869) {
            draggie.position.y = -869;
          }
        });

        draggie.on('pointerDown', function() {
          setTimeout(function() {
            self.oncelp = 0;
          }, 1000)
        })
      }, 300)
    }, 1500);

    setTimeout(function() {
      els.base2top.node.style.transition = 'opacity 0.5s';
      els.base2top.node.style.opacity = '1';
      els.base2top.node.style.opacity = '0';

      els.base2.node.style.transition = 'opacity 0.5s';
      els.base2.node.style.opacity = '1';
      els.base2.node.style.opacity = '0';

      els.base1top.node.style.transition = 'opacity 0.5s';
      els.base1top.node.style.opacity = '1';

      els.copy1.node.style.transition = 'opacity 0.5s';
      els.copy1.node.style.opacity = '0';
    }, 600)

    setTimeout(function() {
      els.copy2.node.style.transition = 'opacity 0.5s';
      els.copy2.node.style.opacity = '0';
    }, 300)
  }

  e.querySelector('.container').onclick = function() {
    if (self.onces === 0) {
      startAnimation();
      self.onces += 1;
      e.querySelector('.container').onclick = function() {}
    }
  };
}

new Ad();
