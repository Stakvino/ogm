$.expr[':'].customFilter = $.expr.createPseudo(function(filterParam) {
  return function(element, context, isXml) {
    return /^\w+/.test(element.textContent);
  };

