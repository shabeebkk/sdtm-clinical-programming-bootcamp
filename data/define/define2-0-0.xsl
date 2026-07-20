<?xml version="1.0" encoding="UTF-8"?>
<!--
  define2-0-0.xsl - renders Define-XML v2.0 as a readable HTML page.

  WHY THIS EXISTS
  define.xml is machine-readable, not human-readable. A reviewer opens it in a
  browser and the browser applies this stylesheet on the fly, turning the XML
  into navigable tables. Nothing is pre-generated: view-source still shows XML.

  CDISC publishes an official stylesheet. This is a deliberately SIMPLER one
  written for teaching - it shows the same structure without the complexity, and
  avoids redistributing a third-party file. For a real submission, use the
  official CDISC stylesheet.

  XSLT 1.0 only: that is all browsers implement.
-->
<xsl:stylesheet version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:odm="http://www.cdisc.org/ns/odm/v1.3"
    xmlns:def="http://www.cdisc.org/ns/def/v2.0"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    exclude-result-prefixes="odm def xlink">

<xsl:output method="html" indent="yes" encoding="UTF-8"
            doctype-public="-//W3C//DTD HTML 4.01//EN"/>

<!-- ==================================================================== -->
<xsl:template match="/">
<html>
<head>
  <title>Define-XML - <xsl:value-of select="//odm:StudyName"/></title>
  <style type="text/css">
    body { font-family: -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
           color: #0F2E3D; background: #F6F9FA; margin: 0; padding: 24px 18px 60px; }
    .wrap { max-width: 1100px; margin: 0 auto; }
    h1 { font-size: 24px; margin: 0 0 2px; }
    h2 { font-size: 17px; color: #0E7C86; margin: 30px 0 8px;
         border-bottom: 2px solid #CFDEE1; padding-bottom: 5px; }
    h3 { font-size: 14px; margin: 22px 0 6px; }
    .sub { color: #5A7682; font-size: 13px; margin: 0 0 4px; }
    .kicker { font-size: 11px; letter-spacing: .12em; text-transform: uppercase;
              color: #0E7C86; font-weight: bold; }
    table { border-collapse: collapse; width: 100%; margin: 6px 0 14px;
            font-size: 12.5px; background: #fff; }
    th { background: #0F2E3D; color: #fff; text-align: left; font-weight: 600;
         padding: 6px 8px; font-size: 11.5px; white-space: nowrap; }
    td { border-top: 1px solid #CFDEE1; padding: 5px 8px; vertical-align: top; }
    tr:nth-child(even) td { background: #F1F6F7; }
    .mono { font-family: ui-monospace, Menlo, Consolas, monospace; }
    .key  { color: #B5651A; font-weight: bold; }
    .req  { color: #C0455B; font-weight: bold; }
    .note { color: #5A7682; font-size: 12px; }
    a { color: #0E7C86; }
    .toc a { display: inline-block; margin: 0 10px 6px 0; font-family: ui-monospace, monospace; }
    .banner { background: #FDF0D5; border-left: 4px solid #E8833A;
              padding: 9px 12px; margin: 14px 0; font-size: 12.5px; }
  </style>
</head>
<body><div class="wrap">

  <div class="kicker">Define-XML
    <xsl:value-of select="//odm:MetaDataVersion/@def:DefineVersion"/></div>
  <h1><xsl:value-of select="//odm:StudyName"/></h1>
  <p class="sub"><xsl:value-of select="//odm:StudyDescription"/></p>
  <p class="sub">
    <xsl:value-of select="//odm:MetaDataVersion/@def:StandardName"/>
    <xsl:text> </xsl:text>
    <xsl:value-of select="//odm:MetaDataVersion/@def:StandardVersion"/>
    <xsl:text> &#183; generated </xsl:text>
    <xsl:value-of select="//odm:ODM/@CreationDateTime"/>
  </p>

  <div class="banner">
    <b>Synthetic training data.</b> This define.xml describes a teaching study. It is
    structurally correct but has not been schema-validated against define2-0-0.xsd.
  </div>

  <!-- ================ dataset index ================ -->
  <h2>Datasets</h2>
  <table>
    <tr><th>Dataset</th><th>Description</th><th>Class</th><th>Structure</th>
        <th>Keys</th><th>File</th></tr>
    <xsl:for-each select="//odm:ItemGroupDef">
      <tr>
        <td class="mono"><a href="#{@OID}"><xsl:value-of select="@Name"/></a></td>
        <td><xsl:value-of select="odm:Description/odm:TranslatedText"/></td>
        <td><xsl:value-of select="@def:Class"/></td>
        <td><xsl:value-of select="@def:Structure"/></td>
        <td class="mono">
          <xsl:for-each select="odm:ItemRef[@KeySequence]">
            <xsl:sort select="@KeySequence" data-type="number"/>
            <xsl:variable name="oid" select="@ItemOID"/>
            <xsl:value-of select="//odm:ItemDef[@OID=$oid]/@Name"/>
            <xsl:if test="position() != last()">, </xsl:if>
          </xsl:for-each>
        </td>
        <td class="mono">
          <xsl:variable name="lid" select="@def:ArchiveLocationID"/>
          <xsl:value-of select="//def:leaf[@ID=$lid]/@xlink:href"/>
        </td>
      </tr>
    </xsl:for-each>
  </table>

  <!-- ================ one table per dataset ================ -->
  <h2>Variables</h2>
  <p class="note">
    <span class="req">Red</span> = Required (Mandatory="Yes").
    <span class="key">Orange</span> = part of the dataset key.
    Hover nothing, click a Method to see the derivation.
  </p>

  <xsl:for-each select="//odm:ItemGroupDef">
    <h3 id="{@OID}">
      <span class="mono"><xsl:value-of select="@Name"/></span>
      <xsl:text> - </xsl:text>
      <xsl:value-of select="odm:Description/odm:TranslatedText"/>
    </h3>
    <table>
      <tr><th>#</th><th>Variable</th><th>Label</th><th>Type</th><th>Length</th>
          <th>Origin</th><th>Codelist</th><th>Method</th></tr>
      <xsl:for-each select="odm:ItemRef">
        <xsl:sort select="@OrderNumber" data-type="number"/>
        <xsl:variable name="oid" select="@ItemOID"/>
        <xsl:variable name="it" select="//odm:ItemDef[@OID=$oid]"/>
        <tr>
          <td><xsl:value-of select="@OrderNumber"/></td>
          <td class="mono">
            <xsl:attribute name="class">
              <xsl:choose>
                <xsl:when test="@KeySequence">mono key</xsl:when>
                <xsl:when test="@Mandatory='Yes'">mono req</xsl:when>
                <xsl:otherwise>mono</xsl:otherwise>
              </xsl:choose>
            </xsl:attribute>
            <xsl:value-of select="$it/@Name"/>
          </td>
          <td><xsl:value-of select="$it/odm:Description/odm:TranslatedText"/></td>
          <td><xsl:value-of select="$it/@DataType"/></td>
          <td><xsl:value-of select="$it/@Length"/></td>
          <td><xsl:value-of select="$it/def:Origin/@Type"/></td>
          <td class="mono">
            <xsl:variable name="cl" select="$it/odm:CodeListRef/@CodeListOID"/>
            <xsl:if test="$cl">
              <a href="#{$cl}"><xsl:value-of select="//odm:CodeList[@OID=$cl]/@Name"/></a>
            </xsl:if>
          </td>
          <td>
            <xsl:variable name="mid" select="@def:MethodOID"/>
            <xsl:if test="$mid">
              <a href="#{$mid}">derivation</a>
            </xsl:if>
          </td>
        </tr>
      </xsl:for-each>
    </table>
  </xsl:for-each>

  <!-- ================ codelists ================ -->
  <h2>Controlled Terminology</h2>
  <xsl:for-each select="//odm:CodeList">
    <h3 id="{@OID}">
      <span class="mono"><xsl:value-of select="@Name"/></span>
    </h3>
    <table>
      <tr><th>Coded Value</th><th>Decode</th></tr>
      <xsl:for-each select="odm:CodeListItem">
        <tr>
          <td class="mono"><xsl:value-of select="@CodedValue"/></td>
          <td><xsl:value-of select="odm:Decode/odm:TranslatedText"/></td>
        </tr>
      </xsl:for-each>
    </table>
  </xsl:for-each>

  <!-- ================ methods ================ -->
  <h2>Derivations</h2>
  <p class="note">Every variable whose Origin is <i>Derived</i> has a method here
    explaining how it was produced.</p>
  <table>
    <tr><th>Method</th><th>Applies to</th><th>Derivation</th></tr>
    <xsl:for-each select="//odm:MethodDef">
      <tr id="{@OID}">
        <td class="mono"><xsl:value-of select="@OID"/></td>
        <td><xsl:value-of select="@Name"/></td>
        <td><xsl:value-of select="odm:Description/odm:TranslatedText"/></td>
      </tr>
    </xsl:for-each>
  </table>

  <!-- ================ documents ================ -->
  <h2>Documents</h2>
  <table>
    <tr><th>Document</th><th>File</th></tr>
    <xsl:for-each select="//def:leaf">
      <tr>
        <td><xsl:value-of select="def:title"/></td>
        <td class="mono">
          <a href="{@xlink:href}"><xsl:value-of select="@xlink:href"/></a>
        </td>
      </tr>
    </xsl:for-each>
  </table>

  <p class="note" style="margin-top:26px">
    Rendered by define2-0-0.xsl - a simplified teaching stylesheet.
    A real submission uses the official CDISC stylesheet.
  </p>

</div></body>
</html>
</xsl:template>

</xsl:stylesheet>
