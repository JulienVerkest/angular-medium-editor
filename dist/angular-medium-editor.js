'use strict';

angular.module('angular-medium-editor', [])

  .directive('mediumEditor', function() {

    return {
      require: 'ngModel',
      restrict: 'AE',
      scope: { bindOptions: '=' },
      link: function(scope, iElement, iAttrs, ctrl) {

        angular.element(iElement).addClass('angular-medium-editor');

        // Parse options
        var opts = {},
            placeholder = '';
        var prepOpts = function() {
          if (iAttrs.options) {
            opts = scope.$eval(iAttrs.options);
          }
          var bindOpts = {};
          if (scope.bindOptions !== undefined) {
            bindOpts = scope.bindOptions;
          }
          opts = angular.extend(opts, bindOpts);
        };
        prepOpts();
        placeholder = opts.placeholder;

        // Insert plugin options
        // https://github.com/orthes/medium-editor-insert-plugin/wiki/v1.0-Configuration
        var addonsInsertPlugin = { // (object) Addons configuration
            images: { // (object) Image addon configuration
              label: '<span class="fa fa-camera"></span>', // (string) A label for an image addon
              uploadScript: 'upload.php', // (string) A relative path to an upload script
              deleteScript: 'delete.php', // (string) A relative path to a delete script
              preview: true, // (boolean) Show an image before it is uploaded (only in browsers that support this feature)
              captionPlaceholder: 'Crédit', // (string) Caption placeholder
              styles: { // (object) Available image styles configuration
                  wide: { // (object) Image style configuration. Key is used as a class name added to an image, when the style is selected (.medium-insert-images-wide)
                      label: '<span class="fa fa-align-justify"></span>', // (string) A label for a style
                      added: function ($el) {}, // (function) Callback function called after the style was selected. A parameter $el is a current active paragraph (.medium-insert-active)
                      removed: function ($el) {} // (function) Callback function called after a different style was selected and this one was removed. A parameter $el is a current active paragraph (.medium-insert-active)
                  },
                  left: {
                      label: '<span class="fa fa-align-left"></span>'
                  },
                  right: {
                      label: '<span class="fa fa-align-right"></span>'
                  },
                  grid: {
                      label: '<span class="fa fa-th"></span>'
                  }
                }
            },
            embeds: { // (object) Embeds addon configuration
                label: '<span class="fa fa-youtube-play"></span>', // (string) A label for an embeds addon
                placeholder: 'Saisissez un lien YouTube, Vimeo, Facebook, Twitter ou Instagram puis pressez Entrer', // (string) Placeholder displayed when entering URL to embed
                captionPlaceholder: 'Légende (optionnel)', // (string) Caption placeholder
                oembedProxy: 'http://medium.iframe.ly/api/oembed?iframe=1' // (string/null) URL to oEmbed proxy endpoint, such as Iframely, Embedly or your own. You are welcome to use "http://medium.iframe.ly/api/oembed?iframe=1" for your dev and testing needs, courtesy of Iframely. *Null* will make the plugin use pre-defined set of embed rules without making server calls.
            }
        };

        scope.$watch('bindOptions', function() {
          // in case options are provided after mediumEditor directive has been compiled and linked (and after $render function executed)
          // we need to re-initialize
          if (ctrl.editor) {
            ctrl.editor.deactivate();
          }
          prepOpts();
          // Hide placeholder when the model is not empty
          if (!ctrl.$isEmpty(ctrl.$viewValue)) {
            opts.placeholder = '';
          }
          ctrl.editor = new MediumEditor(iElement, opts);
          iElement.mediumInsert({
              editor: ctrl.editor,
              enabled: false, // (boolean) If the plugin is enabled
              addons: addonsInsertPlugin
          });

        });

        var onChange = function() {

          scope.$apply(function() {

            // If user cleared the whole text, we have to reset the editor because MediumEditor
            // lacks an API method to alter placeholder after initialization
            if (iElement.html() === '<p><br></p>' || iElement.html() === '') {
              opts.placeholder = placeholder;
              var editor = new MediumEditor(iElement, opts);

              iElement.mediumInsert({
                editor: ctrl.editor,
                enabled: false, // (boolean) If the plugin is enabled
                addons: addonsInsertPlugin
              });
            }

            ctrl.$setViewValue(iElement.html());
          });
        };

        // view -> model
        iElement.on('blur', onChange);
        iElement.on('input', onChange);

        // model -> view
        ctrl.$render = function() {

          if (!this.editor) {
            // Hide placeholder when the model is not empty
            if (!ctrl.$isEmpty(ctrl.$viewValue)) {
              opts.placeholder = '';
            }

            this.editor = new MediumEditor(iElement, opts);
            iElement.mediumInsert({
              editor: ctrl.editor,
              enabled: false, // (boolean) If the plugin is enabled
              addons: addonsInsertPlugin
            });
            
          }

          iElement.html(ctrl.$isEmpty(ctrl.$viewValue) ? '' : ctrl.$viewValue);
          
          // hide placeholder when view is not empty
          if(!ctrl.$isEmpty(ctrl.$viewValue)) angular.element(iElement).removeClass('medium-editor-placeholder'); 
        };

      }
    };

  });
