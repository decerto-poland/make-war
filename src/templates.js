module.exports = {
    urlrewriteXmlContent,
    webXmlContent,
};

function makeHeader(name, value) {
    return `
            <set type="response-header" name="${ name }">${ value }</set>`
}

function indexHtmlHeaders({header, preventCacheForIndexHtml, contentSecurityPolicy, contentSecurityPolicyReportOnly}) {
    return [
        preventCacheForIndexHtml && makeHeader('Cache-Control', 'no-cache'),
        preventCacheForIndexHtml && makeHeader('Pragma', 'no-cache'),
        preventCacheForIndexHtml && makeHeader('Expires', 'Sat, 01 Jan 2000 00:00:00 GMT'),
        contentSecurityPolicy && makeHeader('Content-Security-Policy', contentSecurityPolicy),
        contentSecurityPolicyReportOnly && makeHeader('Content-Security-Policy-Report-Only', contentSecurityPolicyReportOnly),
        ...header
            .map(str => str.match(/(^[^:]*):(.*)/))
            .filter(Boolean)
            .map(([, name, value]) => makeHeader(name, value))
    ].filter(Boolean).join('');
}

function urlrewriteXmlContent(files, passThrough, indexHtmlOptions) {
    return Buffer.from(`<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE urlrewrite
        PUBLIC "-//tuckey.org//DTD UrlRewrite 4.0//EN"
        "http://www.tuckey.org/res/dtds/urlrewrite4.0.dtd">
<urlrewrite>
    ${files.map(file => `
        <rule>${ file.name === 'index.html' ? indexHtmlHeaders(indexHtmlOptions) : '' }
            <from>^/${file.name}$</from>
            <to last="true">-</to>
            <set type="response-header" name="ETag">"${ file.hash }"</set>
        </rule>
    `).join('')}
    ${ passThrough.map(regex => `
        <rule>
            <from>${regex}</from>
            <to last="true">-</to>
        </rule>
    `).join('')}
    <rule>
        <from>^/(.*)$</from>
        <to>/index.html</to>
    </rule>
</urlrewrite>`);
}

function webXmlContent(displayName, description) {
    return Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="http://xmlns.jcp.org/xml/ns/javaee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://xmlns.jcp.org/xml/ns/javaee http://xmlns.jcp.org/xml/ns/javaee/web-app_4_0.xsd" version="4.0" metadata-complete="true">
    <description>${description}</description>
    <display-name>${displayName}</display-name>
    <filter>
        <filter-name>UrlRewriteFilter</filter-name>
        <filter-class>org.tuckey.web.filters.urlrewrite.UrlRewriteFilter</filter-class>
    </filter>
    <filter-mapping>
        <filter-name>UrlRewriteFilter</filter-name>
        <url-pattern>/*</url-pattern>
        <dispatcher>REQUEST</dispatcher>
        <dispatcher>FORWARD</dispatcher>
    </filter-mapping>
</web-app>`, 'utf8');
}
