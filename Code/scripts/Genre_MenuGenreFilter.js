function setGenreFilterMenu(){
  $("#menu-toggle").click(function(e) {
      e.preventDefault();
      $("#wrapper").toggleClass("toggled");
  });

  $(".checkBoxImg").each(function(i, obj) {
    checkboxInput = $(obj).prev().find("input")[0];
    genre = $(checkboxInput).val()
    obj.style.background = colors[genre];
  });
}
