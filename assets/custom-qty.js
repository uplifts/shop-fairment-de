function showDiv1(){
  console.log('clicked');
}

function showDiv2(){
  if (document.getElementById('hiddenThree')) {
    document.getElementById('hiddenThree').style.cssText += ';display:block !important;'
  }
}

function showDiv3(){
  if (document.getElementById('hiddenSix')) {
    document.getElementById('hiddenSix').style.display = 'block';
  }
}