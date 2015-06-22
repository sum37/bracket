require.config({

  'baseUrl': '/',
  'paths': {
    // Core Libraries
    // --------------
    'Q': 'javascripts/lib/q.min',
    'jquery': 'javascripts/lib/jquery',
    'underscore': 'javascripts/lib/underscore',
    'backbone': 'javascripts/lib/backbone',

    // Plugins
    // -------
    'text': 'javascripts/lib/text',
    'Handlebars': 'javascripts/lib/handlebars',
    'hbars': 'javascripts/lib/hbars',

    // Base Files
    // ----------
    'views': 'javascripts/views',
    'models': 'javascripts/models',
    'routers': 'javascripts/routers',
    'templates': 'javascripts/templates',
    'collections': 'javascripts/collections'
  },

  // Sets the configuration for your third party scripts that are not AMD compatible
  'shim': {
    'Handlebars': {
      'exports': 'Handlebars'
    },
    'Q': {
      'exports': 'Q'
    }
  },

  'hbars': {
    'extension': '.tpl'
  }

});
require([
  'routers/mainRouter',
  'routers/state'
],
function(Router, State) {
  // watch the routes
  window.State = State;
  State.initialize();
});
