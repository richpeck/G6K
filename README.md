# G6K

G6K is a tool that enables the creation and online publishing of calculation simulators without coding. It has a simulation engine and an administration module.

A calculation simulator is an online service made available to a user to enable them to calculate the results (taxes, social benefits, etc.) corresponding to their particular situation. The results are calculated on the basis of data supplied by the user, reference data (eg amount of a tax) and business rules reflecting the current legislation in the field of simulation.

[Learn more](http://eureka2.github.io/g6k/documentation/en/learn-more.html)

## Prerequisites for Symfony 2
* PHP Version 5.3.3 + (recommended 5.5.9+)
* JSON enabled
* ctype
* date.timezone in php.ini
* auto_detect_line_endings = On in php.ini
* PHP-XML module
* 2.6.21+ version of libxml
* PHP tokenizer
* Modules mbstring, iconv, POSIX (only on * nix), Intl with ICU 4+, and APCU 3.0.17+ APC (highly recommended) must be installed
* recommended php.ini settings:
  * short_open_tag = Off
  * magic_quotes_gpc = Off
  * register_globals = Off
  * session.auto_start = Off

## Prerequisites for G6K
* PDO enabled
* pdo_pgsql and / or pdo_sqlite activated
* pgsql and / or sqlite3 activated
* SimpleXML enabled
* serialize_precision = -1

## Installation
1. If you plan to use MySQL or PostgreSQL, create a user with "CREATE DATABASE" and "CREATE TABLE" privileges using the administration tool of your RDBMS.
2. Be placed in the <DOCUMENT_ROOT> Web Server
3. Download composer.phar (https://getcomposer.org/download/) in <DOCUMENT_ROOT>
4. Under a shell or DOS, execute: ``php -d memory_limit=-1 composer.phar create-project eureka2/g6k simulator/``
5. Enter the parameter values required by the installer, including:
  * database_driver => pdo_pgsl, pdo_mysql or pdo_sqlite
  * database_host => name or IP address of your database server (simply &lt;Enter&gt; in case of SQLite)
  * database_port => port of the database server (simply &lt;Enter&gt; in case of SQLite)
  * database_name => name of the database where the users of the administration interface will be installed 1. (simply &lt;Enter&gt; in case of SQLite)
  * database_user => User name for connecting to the database (simply &lt;Enter&gt; in case of SQLite)
  * database_password => this user's password (simply &lt;Enter&gt; in case of SQLite)
  * database_path => used in the case of SQLite and ignored in other cases, so make &lt;Enter&gt;
  * locale => en

Normally the installer displays the message 'Installing the users of the administration interface'  
However, on some platforms, this message does not appear. If so, run the following commands:  
``cd simulator``  
``php ../composer.phar run-script post-install-cmd``

--

## NGINX

```
# /etc/nginx/sites-enabled/default

##########################################
##########################################

##        General Server Setup          ##

##########################################
##########################################

## General ##
## Ref: https://gist.github.com/plentz/6737338 ##

# don't send the nginx version number in error pages and Server header
server_tokens off;

# config to don't allow the browser to render the page inside an frame or iframe
# and avoid clickjacking http://en.wikipedia.org/wiki/Clickjacking
# if you need to allow [i]frames, you can use SAMEORIGIN or even set an uri with ALLOW-FROM uri
# https://developer.mozilla.org/en-US/docs/HTTP/X-Frame-Options
add_header X-Frame-Options SAMEORIGIN;

# when serving user-supplied content, include a X-Content-Type-Options: nosniff header along with the Content-Type: header,
# to disable content-type sniffing on some browsers.
# https://www.owasp.org/index.php/List_of_useful_HTTP_headers
# currently suppoorted in IE > 8 http://blogs.msdn.com/b/ie/archive/2008/09/02/ie8-security-part-vi-beta-2-update.aspx
# http://msdn.microsoft.com/en-us/library/ie/gg622941(v=vs.85).aspx
# 'soon' on Firefox https://bugzilla.mozilla.org/show_bug.cgi?id=471020
add_header X-Content-Type-Options nosniff;

# This header enables the Cross-site scripting (XSS) filter built into most recent web browsers.
# It's usually enabled by default anyway, so the role of this header is to re-enable the filter for
# this particular website if it was disabled by the user.
# https://www.owasp.org/index.php/List_of_useful_HTTP_headers
add_header X-XSS-Protection "1; mode=block";

# with Content Security Policy (CSP) enabled(and a browser that supports it(http://caniuse.com/#feat=contentsecuritypolicy),
# you can tell the browser that it can only download content from the domains you explicitly allow
# http://www.html5rocks.com/en/tutorials/security/content-security-policy/
# https://www.owasp.org/index.php/Content_Security_Policy
# I need to change our application code so we can increase security by disabling 'unsafe-inline' 'unsafe-eval'
# directives for css and js(if you have inline css or js, you will need to keep it too).
# more: http://www.html5rocks.com/en/tutorials/security/content-security-policy/#inline-code-considered-harmful
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://ssl.google-analytics.com https://assets.zendesk.com https://connect.facebook.net; img-src 'self' https://ssl.google-analytics.c$
# Remove headers
# Required Headers-More module (https://github.com/openresty/headers-more-nginx-module)
#more_clear_headers Server X-Powered-By X-Runtime;

##########################################
##########################################

## General ##
## This is to redirect the IP and configure the likes of LetsEncrypt ##
server {

  ## Ports ##
  listen 80 default;
  listen [::]:80 default;

## Details ##
## Catch-all server name ##
server_name _;

## LetsEncrypt ##
location ~ /.well-known {
  allow all;
  root /etc/letsencrypt;
}

## Action ##
return 301 https://g6k.carte-grise-pref.fr$request_uri;
}

##########################################
##########################################
```

```
# /etc/nginx/sites-enabled/your-site.com

##########################################
##########################################

##         carte-grise-pref.fr          ##

##########################################
##########################################

##   General server setup in default    ##

##########################################
##########################################

## Apex to WWW ##
## HTTPS ##
server {

  ## Ports ##
  listen 443 ssl;
  listen [::]:443 ssl;

  ## Details ##
  ## Only accept WWW ##
  server_name g6k.carte-grise-pref.fr;

  ## Root ##
  root /var/www/calcul;

  ## Location ##
  rewrite ^/app\.php/?(.*)$ /$1 permanent;

  ## PHP ##
  try_files $uri @rewriteapp;

  ## Admin ##
  location /admin {
    rewrite ^(.*)$ /app_admin.php/$1 last;
  }

  ## Main ##
  location @rewriteapp {
    rewrite ^(.*)$ /app.php/$1 last;
  }

  ## SSL ##
  include /etc/nginx/ssl.conf;

  ## Certs ##
  ssl_certificate     /etc/letsencrypt/live/g6k.carte-grise-pref.fr/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/g6k.carte-grise-pref.fr/privkey.pem;

  ## Symfony ##
  ## PRODUCTION ENV ##
  location ~ ^/(app|app_admin)\.php(/|$) {
    fastcgi_pass unix:/var/run/php/php7.2-fpm.sock;
    fastcgi_split_path_info ^(.+\.php)(/.*)$;
    include fastcgi_params;
    # When you are using symlinks to link the document root to the
    # current version of your application, you should pass the real
    # application path instead of the path to the symlink to PHP
    # FPM.
    # Otherwise, PHP's OPcache may not properly detect changes to
    # your PHP files (see https://github.com/zendtech/ZendOptimizerPlus/issues/126
    # for more information).
    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    fastcgi_param DOCUMENT_ROOT $realpath_root;
    # Prevents URIs that include the front controller. This will 404:
    # http://domain.tld/app.php/some-path
    # Remove the internal directive to allow URIs like this
    internal;
  }

  ## Favicons ##
  location = /favicon.ico {
    access_log     off;
    log_not_found  off;
  }

  # static file 404's aren't logged and expires header is set to maximum age
  location ~* \.(jpg|jpeg|gif|css|png|js|ico|html)$ {
    access_log off;
    expires max;
  }

  ## PHP ##
  # return 404 for all other php files not matching the front controller
  # this prevents access to other php files you don't want to be accessible.
  location ~ \.php$ {
    return 404;
  }

  ## DENY ALL . FILES ##
  ## Don't need to use Apache's stuff in NGinx ##
  location ~ /\. {
    deny  all;
  }

  ## STATIC ASSETS ##
  ## Used to store images, CSS/JS etc ##
  location /(bundles|media) {
    access_log off;
    expires 30d;

    try_files $uri @rewriteapp;
  }

  ## LOGS ##
  error_log /var/log/nginx/g6k_error.log;
  access_log /var/log/nginx/g6k_access.log;

}

##########################################
##########################################
```

--

## Documentation

### Administrator's Guide

[ [en](http://eureka2.github.io/g6k/documentation/en/index.html) ]
[ [fr](http://eureka2.github.io/g6k/documentation/fr/index.html) ]

### Classes

[Documentation of G6K classes](http://eureka2.github.io/g6k/documentation/classes/)

## Innovation Award

<table class="framed light" border>
  <tr>
    <td>
      <a href="https://www.phpclasses.org/" title="PHP Classes" alt="PHP Classes">
        <img src="https://files.phpclasses.org/graphics/phpclasses/logo-small-phpclasses.svg" width="75" height="24" alt="PHP Classes" style="vertical-align: top">
      </a>
     </td>
    <td>
     <b><a href="https://www.phpclasses.org/package/10556-PHP-Generate-simulator-tools-to-perform-calculations.html">G6K</a>
       By <a href="https://www.phpclasses.org/browse/author/549500.html">eureka2</a></b>
     </td>
    <td>
      <a href="https://www.phpclasses.org/award/innovation/"><img src="https://www.phpclasses.org/award/innovation/nominee.gif" width="89" height="89" alt="PHP Programming Innovation award nominee" title="PHP Programming Innovation award nominee" border="0"></a><br><b><span style="font-size: large">April 2018 Number 6</span></b>
    </td>
  </tr>
  <tr>
    <td colspan="3">
      There are many sites that are useful because they provide means to let the users perform calculations of some kind from simple values entered in Web forms.
      <br>
      This package provides a Web interface to implement a generic system for designing and providing access to pages that provide several types of calculator tools.
      <br>
      Manuel Lemos
	</td>
  </tr>
</table>

## Copyright and license

&copy; 2015-2018 Eureka2 - Jacques Archimède. Code released under the [MIT license](https://github.com/eureka2/G6K/blob/master/LICENSE).
