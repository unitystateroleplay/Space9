// Function to toggle between different dashboard sections
function showContent(contentId) {
    const contents = document.querySelectorAll('.content');
    contents.forEach(content => content.classList.remove('active'));

    const activeContent = document.getElementById(contentId);
    activeContent.classList.add('active');

    // Toggle active class on the menu items
    const menuItems = document.querySelectorAll('.sidebar .nav li a');
    menuItems.forEach(item => item.classList.remove('active'));
    
    const activeMenu = document.querySelector(`.sidebar .nav li a[href="#${contentId}"]`);
    activeMenu.classList.add('active');
}
