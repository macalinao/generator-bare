'use strict';
var _ = require('lodash');
var yeoman = require('yeoman-generator');
var npmName = require('npm-name');
var chalk = require('chalk');
var yosay = require('yosay');
var path = require('path');

module.exports = yeoman.generators.Base.extend({
  initializing: function() {
    this.pkg = require('../package.json');

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the ' + chalk.red('bare') + ' generator!'
    ));
  },

  askForModuleName: function() {
    var done = this.async();

    var prompts = [{
      name: 'name',
      message: 'Module Name',
      default: path.basename(process.cwd()),
    }, {
      type: 'confirm',
      name: 'pkgName',
      message: 'The name above already exists on npm, choose another?',
      default: true,
      when: function(answers) {
        var done = this.async();

        npmName(answers.name, function(err, available) {
          if (!available) {
            done(true);
            return;
          }

          done(false);
        });
      }
    }];

    this.prompt(prompts, function(props) {
      if (props.pkgName) {
        return this.askForModuleName();
      }

      this.slugname = _.slugify(props.name);
      this.safeSlugname = this.slugname.replace(/-+([a-zA-Z0-9])/g, function(g) {
        return g[1].toUpperCase();
      });

      done();
    }.bind(this));
  },

  askFor: function() {
    var done = this.async();

    var prompts = [{
      name: 'description',
      message: 'Description',
      default: 'The best module ever.'
    }, {
      name: 'license',
      message: 'License',
      default: 'MIT'
    }, {
      name: 'githubUsername',
      message: 'GitHub username',
      store: true
    }, {
      name: 'author',
      message: 'Author',
      store: true
    }, {
      name: 'keywords',
      message: 'Key your keywords (comma to split)',
      default: ''
    }];

    this.prompt(prompts, function(props) {
      if (props.githubUsername) {
        this.repoUrl = props.githubUsername + '/' + this.slugname;
      } else {
        this.repoUrl = 'user/repo';
      }

      this.keywords = props.keywords.split(',').map(function(el) {
        return el.trim();
      });

      this.props = props;

      done();
    }.bind(this));
  },

  writing: function() {
    this.template('_package.json', 'package.json');
    this.template('README.md');
    this.template('index.js');
    this.template('test.js');
    this.template('gitignore', '.gitignore');
    this.template('editorconfig', '.editorconfig');
    this.template('jshintrc', '.jshintrc');
    this.template('travis.yml', '.travis.yml');
  },

  install: function() {
    this.installDependencies({
      skipInstall: this.options['skip-install']
    });
  }
});
