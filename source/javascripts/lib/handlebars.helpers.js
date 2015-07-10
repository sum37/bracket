Handlebars.registerHelper('gameStatus', function(match) {
  var typeName = 'default';

  // TODO: check if there is a finalist, and if so, check to see if its me
  switch (match.status){
    case 'pending':
      typeName = 'warning';
      break;
    case 'active':
      typeName = 'success';
      break;
    case 'finished':
      typeName = 'info';
      break;
  }
  return typeName;
});

Handlebars.registerHelper('gameType', function(match) {
  return (typeof match.active !== undefined && match.active === true) ? true : false;
});

Handlebars.registerHelper('initialz', function(user) {
  return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
});

Handlebars.registerHelper('json', function(context) {
  return JSON.stringify(context);
});

/**
 * grabs the player data from the main array so that the DB wont have to store as much data
 * @return {String} returns the template with appropriate data
 *
 * USE:
 * {{#matchPlayer players}}
 * 	<div>{{firstName}}</div>
 * {{/matchPlayer}}
 */
Handlebars.registerHelper('matchPlayer', function(context, options) {
  if (!context) { return; }

  var playerData = window.__ap || [];
  var a = context[0];
  var b = context[1];

  playerData.map(function(obj, idx) {
    if (obj.objectId === a) {
      context[0] = obj;
    }

    if (obj.objectId === b) {
      context[1] = obj;
    }
  });

  return context.map(function(item) {
    return '<div class="match-player">' + options.fn(item) + '</div>';
  }).join('\n');
});

/**
 * Mutates the tier data into usable sets of tiers and spacers
 * @return {String} returns the template with appropriate data
 *
 * USE:
 * {{#tiersFlow this}}
 * {{/tiersFlow}}
 */
Handlebars.registerHelper('tiersFlow', function(context, options) {
  if (!context || context.tierCount < 1) { return; }

  var tiers = [];
  var tierNamespace = 'tier_';

  for (var i = 0; i < context.tierCount; i++) {
    var k = i + 1;
    var tierData = context[tierNamespace + k];
    var spacers = [];

    if (k !== context.tierCount) {
      spacers.length = Math.round(tierData.length / 2);
    } else {
      spacers = null;
    }

    tiers.push({
      matches: tierData,
      spacers: spacers
    });
  }

  console.log('newContext', tiers, context);

  // var playerData = window.__ap || [];
  // var a = context[0];
  // var b = context[1];
  //
  // playerData.map(function(obj, idx) {
  //   if (obj.objectId === a) {
  //     context[0] = obj;
  //   }
  //
  //   if (obj.objectId === b) {
  //     context[1] = obj;
  //   }
  // });

  // return context.map(function(item) {
  //   return '<div class="match-player">' + options.fn(item) + '</div>';
  // }).join('\n');

  return options.fn(tiers);
});

// new data structure:
// var tiers = [{
//   matches: [{ players: [] }],
//   spacers: [{}]
// }];

Handlebars.registerHelper('timeago', function(item) {
  if (!item.updatedAt || !item.createdAt) { return ''; }

  var ts = item.updatedAt || item.createdAt;

  var timeAgo = {
    settings: {
      refreshMillis: 60000,
      allowPast: true,
      allowFuture: false,
      localeTitle: false,
      cutoff: 0,
      strings: {
        prefixAgo: null,
        prefixFromNow: null,
        suffixAgo: 'ago',
        suffixFromNow: 'from now',
        inPast: 'any moment now',
        seconds: 'less than a minute',
        minute: 'about a minute',
        minutes: '%d minutes',
        hour: 'about an hour',
        hours: 'about %d hours',
        day: 'a day',
        days: '%d days',
        month: 'about a month',
        months: '%d months',
        year: 'about a year',
        years: '%d years',
        wordSeparator: ' ',
        numbers: []
      }
    },

    inWords: function(distanceMillis) {
      if (!this.settings.allowPast && !this.settings.allowFuture) {
        throw 'timeago allowPast and allowFuture settings can not both be set to false.';
      }

      var $l = this.settings.strings;
      var prefix = $l.prefixAgo;
      var suffix = $l.suffixAgo;
      if (this.settings.allowFuture) {
        if (distanceMillis < 0) {
          prefix = $l.prefixFromNow;
          suffix = $l.suffixFromNow;
        }
      }

      if (!this.settings.allowPast && distanceMillis >= 0) {
        return this.settings.strings.inPast;
      }

      var seconds = Math.abs(distanceMillis) / 1000;
      var minutes = seconds / 60;
      var hours = minutes / 60;
      var days = hours / 24;
      var years = days / 365;

      function substitute(stringOrFunction, number) {
        var string = $.isFunction(stringOrFunction) ? stringOrFunction(number, distanceMillis) : stringOrFunction;
        var value = ($l.numbers && $l.numbers[number]) || number;
        return string.replace(/%d/i, value);
      }

      var words = seconds < 45 && substitute($l.seconds, Math.round(seconds)) ||
        seconds < 90 && substitute($l.minute, 1) ||
        minutes < 45 && substitute($l.minutes, Math.round(minutes)) ||
        minutes < 90 && substitute($l.hour, 1) ||
        hours < 24 && substitute($l.hours, Math.round(hours)) ||
        hours < 42 && substitute($l.day, 1) ||
        days < 30 && substitute($l.days, Math.round(days)) ||
        days < 45 && substitute($l.month, 1) ||
        days < 365 && substitute($l.months, Math.round(days / 30)) ||
        years < 1.5 && substitute($l.year, 1) ||
        substitute($l.years, Math.round(years));

      var separator = $l.wordSeparator || '';
      if ($l.wordSeparator === undefined) { separator = ' '; }

      return $.trim([prefix, words, suffix].join(separator));
    },

    parse: function(iso8601) {
      var s = $.trim(iso8601);
      s = s.replace(/\.\d+/, '');

      // remove milliseconds
      s = s.replace(/-/, '/').replace(/-/, '/');
      s = s.replace(/T/, ' ').replace(/Z/, ' UTC');
      s = s.replace(/([\+\-]\d\d)\:?(\d\d)/, ' $1$2'); // -04:00 -> -0400
      s = s.replace(/([\+\-]\d\d)$/, ' $100'); // +09 -> +0900
      return new Date(s);
    }
  };

  function distance(date) {
    return (new Date().getTime() - new Date(date).getTime());
  }

  return timeAgo.inWords(distance(ts));
});
