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
# /etc/nginx/sites-enabled/carte-grise-pref.fr

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

  #####################################################
  #####################################################

  ## Ports ##
  listen 443 ssl;
  listen [::]:443 ssl;

  ## Details ##
  ## Only accept WWW ##
  server_name g6k.carte-grise-pref.fr;

  #####################################################
  #####################################################

  ## SSL ##
  include /etc/nginx/ssl.conf;

  ## Certs ##
  ssl_certificate     /etc/letsencrypt/live/g6k.carte-grise-pref.fr/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/g6k.carte-grise-pref.fr/privkey.pem;

  #####################################################
  #####################################################

  ## Root ##
  ## This is meant to provide a default "root" from which every part of the app is served ##
  ## Each location block can override this ##
  ## https://www.nginx.com/resources/wiki/start/topics/tutorials/config_pitfalls/#root-inside-location-block ##
  root /var/www/g6k/calcul;

  #####################################################
  #####################################################

  ####################
  ## ORDER (NodeJS) ##
  ####################

  ## This accepts "draft order" requests on the /order [POST] endpoint ##
  ## Needs to be here otherwise the other scripts could overwrite it ##
  ## https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-18-04#step-4-%E2%80%94-setting-up-nginx-as-a-reverse-proxy-server ##
  location ~ ^/order($|/.*$) {

    ## Restrict Access ##
    ## This should be in the main block but has to be here ##
    ## There is no reason to gain access to this beyond the need of testing ##
    valid_referers server_names none carte-grise-pref.fr cartegrise-pref-fr.myshopify.com;
    if ($invalid_referer) { return 403; }

    ## !GET/POST ##
    ## Don't need to provide functionality to others ##
    ## https://bjornjohansen.no/restrict-allowed-http-methods-in-nginx ##
    if ($request_method !~ ^(GET|POST|HEAD)$) { return 403; }

    ## POST ##
    ## This is where the API transaction happens ##
    ## Only accepts referrers from the Shopify store ##
    if ($request_method = 'POST') {

      ## CORS ##
      ## Allows us to define which site/domain is able to send JS data ##
      ## Not 100% secure but should be helpful ##
      add_header "Access-Control-Allow-Origin"  "https://carte-grise-pref.fr";
      add_header "Access-Control-Allow-Methods" "POST";
      add_header "Access-Control-Allow-Headers" "Authorization, Origin, X-Requested-With, Content-Type, Accept";

    }

    ## Server ##
    ## This needs to match a PM2 instance running NodeJS ##
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;

    ## GET ##
    ## This is used for testing, so we need to allow users to access the resource ##
    ## For this, we can use just whitelist the development IP ##
    allow 86.22.27.94;
    deny all;

  }  

  #####################################################
  #####################################################

  ####################
  ##   MAIN (G6K)   ##
  ####################

  ## General Rewrite ##
  rewrite ^/app\.php/?(.*)$ /$1 permanent;

  ## Restrict Access ##
  ## I originally presumed an iFrame would use the server's IP ##
  ## Unfortunately, I was wrong, so need to be more creative with how to do it ##
  ## http://nginx.org/en/docs/http/ngx_http_referer_module.html ##
  valid_referers server_names none carte-grise-pref.fr cartegrise-pref-fr.myshopify.com;
  if ($invalid_referer) { return 403; }

  ## PHP ##
  ## Sends all the /x requests to the @rewriteapp location ##
  try_files $uri @rewriteapp;

  ###############
  ##   Admin   ##
  ###############
  location /admin {

    ## Forward requests to /app_admin.php ##
    rewrite ^(.*)$ /app_admin.php/$1 last;

    ## Access ##
    ## Only allow GET requests from dev IP ##
    allow 86.22.27.94;
    deny all;

  }

  ##############
  ##   Main   ##
  ##############
  location @rewriteapp {

    ## Forward requests to /app.php ##
    rewrite ^(.*)$ /app.php/$1 last;

    ## Access ##
    ## Only allow GET requests from our dev IP ##
    allow 86.22.27.94;
    deny all;

  }

  #################
  ##   Symfony   ##
  #################
  location ~ ^/(app|app_admin)\.php(/|$) {

    ## Restrict Access ##
    ## Need to restrict access to this ##
    ## Only want the site being pulled via iframe (as /order) and the dev domain ##
    valid_referers server_names none carte-grise-pref.fr cartegrise-pref-fr.myshopify.com;
    if ($invalid_referer) { return 403; }

    ## PHP ##
    ## Remember to change php7.2-fpm to the current version of PHP ##
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

    ## DEV ##
    ## This is used for testing, so we need to allow users to access the resource ##
    ## For this, we can use just whitelist the development IP ##
    allow 86.22.27.94;
    deny all;

  }

  #####################################################
  #####################################################

  ################
  ##   Assets   ##
  ################
  location ~ /(bundles|media) {
    access_log off;
    expires 30d;
    try_files $uri @rewriteapp;
  }

  #####################################################
  #####################################################

  ####################
  ##     Extras     ##
  ####################

  ## Favicons ##
  ## Keep favicons out of the logs ##
  location = /favicon.ico {
    access_log     off;
    log_not_found  off;
  }

  ## Static ##
  ## Don't track static images etc ##
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

  ## Error Pages ##
  ## https://www.cyberciti.biz/faq/howto-nginx-customizing-404-403-error-page/ ##
  error_page 403 /403;
  location /403 {
    root /var/www;
    try_files $uri.html =404;
    internal; ## Shows the page without changing URL ##
  }

  ## DENY . FILES ##
  ## Don't need to use Apache's stuff in NGinx ##
  location ~ /\. {
    deny  all;
  }

  ## LOGS ##
  error_log /var/log/nginx/g6k_error.log;
  access_log /var/log/nginx/g6k_access.log;

}

#####################################################
#####################################################
```

--

## NODE

Setup the PM2 Server:
https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-18-04#step-4-%E2%80%94-setting-up-nginx-as-a-reverse-proxy-server

--

## THEME.JS

This is to be added to Shopify:

```
/* ---------------------------------------- */
/*       RPECK ADDITIONS 13/12/2018         */
/* ---------------------------------------- */

/* iFrame resize */
/* https://github.com/davidjbradshaw/iframe-resizer */
$('iframe').iFrameResize( [{ log:true, checkOirign:false }] );

/* Send requests to iFrame */
/* This is used to manage the way in which the iFrame handles the form */
/* Since we don't have access to its DOM elements, we'll basically do the equivalent of a poll and parse the response */
window.setInterval(function(e){

  /* We have to set the 'form' element */
  /* From this, we're able to get the returned data */
  $('#sim')[0].contentWindow.postMessage({form: {}}, "*");

}, 1000);

/* Get Simulation Data from iFrame */
/* Requires PostMessage */
/* https://blog.teamtreehouse.com/cross-domain-messaging-with-postmessage */

/* This works by binding a message to be sent on button click */
/* When the "calculate" button is clicked, the message is sent */
/* The partner page then needs to send a response, which we can use in our further script */
window.addEventListener('message',function(event) {

  /* Returns JSON object, which we need to validate */
  /* Need to check if the main element is "form" */
  if(event.data.form) {

    /* To do this, we will create a "top level" JSON level as follows: */
    /* json = { "form": { "x":"y"; }} */
    /* This allows us to only respond to the form data */
    /* As opposed to the iFrame data that is managed by iFrameResizer */
    //console.log(event.data.form);

    /* This is used to unlock the order button and build the hidden fields */
    /* It's a bit bloated but will do for a first version */
    createOrder((event.data.form.results["y6_taxes_a_payer"] === "" ? false : true), event.data.form);

  } /* endif */

},false);

/* Without this, the source.postmessage won't work on the child page */
window.addEvent('message',function(event) {});

/* After receiving a reply (populating a var), we need to build order button */
/* This will add the product to the cart and append the metadata to it as a "line item property" (specific selections from the form) */
/* Whilst we could always append the details to the cart, to allow people to purchase multiple grey cards, we should append the information to line items */
/* https://ui-elements-generator.myshopify.com/pages/line-item-property */
/* This is hacky as hell, but can be refactored and we can also create an API version too */
function createOrder($enabled, $data){

  /* Validate against $enabled */
  /* Allows us to determine whether the form is submittable or not */
  if($enabled == true) {

    /* Input */
    /* Gives us a standardized block to add each time */
    var input = function(name,val,checkout=true) {
      var checkout_visible = (checkout == true ? "" : "_" );
      return "<input id=\""+ name +"\" type=\"hidden\" name=\"properties["+ checkout_visible + name + "]\" value=\""+ val +"\" />";
    }

    /* Get correct variant ID */
    /* This is done by cycling through the list of variants and setting the right one */
    /* This way, we keep all the ID's on the page and are able to recycle them each time */
    $('#variant').children("input").each( function(){

      /* Get info */
      var range = $(this).data("range").split("-");
      var data  = $data.results["y1_taxe_regionale"].replace(/ /g, '');

      /* Set ID */
      /* Just use ternary operator */
      $(this).attr("name", ((parseFloat(data) >= parseFloat(range[0])) && (parseFloat(data) < parseFloat(range[1]))) ? "id" : "_id");

    });

    /* Empty Lineitem Properties */
    /* This is hacky but works - to refactor, make sure you either add or update the value of each element */
    /* https://stackoverflow.com/a/1675233/1143732 */
    $('#lineitem_properties').empty();

    /* Order form */
    /* Hidden elements */
    /* Cycle through form data and add it to the form */
    $.each($data, function(element,value){

      /* Results is a hash unto itself */
      if(element == "results") {

        $.each($data[element], function(id,val){
          $('#lineitem_properties').append(input(id,val,false));
        });

      } else {
      	$('#lineitem_properties').append(input(element.toUpperCase(),value));
      }
    });

  }

  /* Order button */
  $('#AddToCart-product-template').prop('disabled', !$enabled);

}
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
