/*
 * @author: Michelle Gybels
 */

var genreFilter;

function setGenreFilterMenu() {
    genreFilter = [];
    $("#menu-toggle").click(function (e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });

    $("#allCheckbox").prop('checked', true);

    //Functionality for genre checkboxes
    $(".checkBoxImg").each(function (i, obj) {
        checkboxInput = $(obj).prev().find("input")[0];
        genre = $(checkboxInput).val()
        var checkboxInput = $(obj).prev().find("input")[0];
        var genre = $(checkboxInput).val()
        $(checkboxInput).prop('checked', true);
        obj.style.background = colors[genre];

        //Add genre to the genre filter by default
        genreFilter.push(genre);

        $(checkboxInput).click(function () {
            checkedGenre = $(checkboxInput).val();
            if ($(this).is(':checked')) {
                genreFilter.push(checkedGenre);
            } else {
                // remove element of index
                var index = genreFilter.indexOf(checkedGenre);
                if (index > -1) {
                    genreFilter.splice(index, 1);
                }
                setAllUnchecked();
            }
            //console.log(genreFilter);
            setFilterGenre(genreFilter);

        });
    });

    //Functionality for "all" checkbox
    $("#allCheckbox").click(function () {
        if ($(this).is(':checked')) {
            setAllGenresChecked();
        } else {
            setAllGenresUnChecked();
        }
        //console.log(genreFilter);
        setFilterGenre(genreFilter);
    });
}

function setAllUnchecked() {
    $("#allCheckbox").prop('checked', false);
}

function setAllGenresUnChecked() {
    genreFilter = [];
    $(".checkBoxImg").each(function (i, obj) {
        var checkboxInput = $(obj).prev().find("input")[0];
        $(checkboxInput).prop('checked', false);
    });
}

function setAllGenresChecked() {
    $(".checkBoxImg").each(function (i, obj) {
        var checkboxInput = $(obj).prev().find("input")[0];
        $(checkboxInput).prop('checked', true);
        selectedGenre = $(checkboxInput).val();
        var index = genreFilter.indexOf(selectedGenre);
        if (index == -1) {
            genreFilter.push(selectedGenre);
        }
    });
}
