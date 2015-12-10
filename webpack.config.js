/*
 * Базовый конфиг webpack
 *
 *
 * Описание:
 * Конфиг содержит в себе основную конфигурацию - путь к файлов сборки,
 * настройки бандлов в зависимости от окружения и т.д.
 * Описание всех сборок харнится в директории webpack-entries.
 *
 *
 * Добавление новой сборки:
 * 1. Создать файл сборки внутри webpack-entries с подходящей для сборки папкой (например по названию раздела сайта)
 *    !!! ВНИМАНИЕ !!! - каждый скрипт внутри webpack-entries, должен находится внутри какой то из папок
 *    если нельзя четко выделить папку (раздел сайта) к которой его относится, можно поместить его в папку other
 * 2. Настройки конфига заключается в указании точки входа и других конфигураций  webpack, но со строгой
 *    связью с этой точкой сборки (чтобы не были затронуты другие сборки)
 *
 *
 * Пример:
 * Скрипт для сборки приложения - управление новостройками, в разделе недвижимости.
 * 1. Создаем конфиг и сохраняем его в папку webpack-entries/realty/
 * 2. Сам конфиг: building-manage-objects
 *

// ------------------------
'use strict';

// !!! Пожелание - название точки входа (а следовательно и выходного названия скрипта)
// должно включать в себя название папки конфига в которой он находиться и название конфига для сборки
// в данном случае realty + building-manage-objects - это гарантирует,
// что имена файлов не пересутся в в выходной папке


// ./webpack-entries/realty/building-manage-objects.js
module.exports = {
    entry: {
        // Название точки (файла)          // Путь к входному файлу компонента
        'realty-building-manage-objects' : './js/realty/building-manage-objects/index.js',
    },
};

// ------------------------

 *
 */

var webpack = require('webpack');
var requireDir = require('require-dir');
var mergeUtil = require('merge-deep');
var _ = require('underscore');
var path = require('path');

var DEV_ENV = 'development';
var PROD_ENV = 'production';
var NODE_ENV = process.env.NODE_ENV || DEV_ENV;

var resultConfig = {
    context: path.join(__dirname, 'static'),
    output: {
        path: path.join(__dirname, 'public/js'),
        filename: '[name].js',
    },

    plugins: [
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify(NODE_ENV)
        }),
    ],

    watch: NODE_ENV === DEV_ENV,

    devtool: NODE_ENV === DEV_ENV ? 'source-map' : false,
};

// Минимизация кода, если production режим
if (NODE_ENV === PROD_ENV) {
    resultConfig.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    );
}

var configList = requireDir('./webpack-entries', {recurse: true});

if (!_.isEmpty(configList)) {
    // Цикл по папкам
    _.each(configList, function (configs) {
        // Пустая папка (файл конфига)
        if (_.isEmpty(configs)) {
            return;
        }

        if (configs.entry) {
            // Если есть свойства точки входа, значит это файл конфига
            resultConfig = mergeUtil(resultConfig, configs);
        } else {
            // Цикл по файлам конфигов в папке
            _.each(configs, function (config) {
                resultConfig = mergeUtil(resultConfig, config);
            });
        }
    });
}

module.exports = resultConfig;

