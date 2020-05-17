// shape
// function searchAll_shape() {
//   $.getJSON("/add_shape/searchAll", function (result) {
//     console.log("Jquery Json:");
//     console.log(result);
//     $(".search-tb").html("");
//     $.each(result, function (i, n) {
//       $(".search-tb").append(
//         "<tr>" +
//         "<td><input type='checkbox' name=" +
//         n.id +
//         "></td>" +
//         "<td>" +
//         n.object_name +
//         "</td>" +
//         "<td>" +
//         n.object_type +
//         "</td>" +
//         "<td><a href='#' class='item_delete' id=" +
//         n.object_id +
//         ">删除</a></td>" +
//         "</tr>"
//       );
//     });
//   });
// }

// $(function () {
//   $(".search-tb").on("click", ".item_delete", function () {
//     var id = $(this).attr("id");
//     console.log(id);
//     $.ajax({
//       type: "get",
//       url: "/add_shape/delete",
//       data: {
//         delete_id: id
//       },
//       success: function (result) {
//         $("#tips_insert_success").fadeIn("slow").delay(1000).fadeOut("slow");

//         $("#tips_insert_success>span").html("").append(result);
//         console.log(result);
//         searchAll_shape();
//       },
//     });
//   });
// });