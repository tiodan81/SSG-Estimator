var rgView = {}

rgView.init = function() {
  $('#rg-content').show()
    .siblings().hide()
  rgView.infiltDisplay()
  rgView.vegInfDisplay()
  rgView.vegOutDisplay()
  rgView.handleSave()
}

rgView.infiltDisplay = function() {
  $('#infiltKnown').off('click').on('click', function() {
    if (this.checked) {
      $('#rgInfiltContainer').show()
    } else {
      $('#rgInfiltContainer').hide()
    }
  })
}

rgView.vegInfDisplay = function () {
  $('input[name=rgInflow]').off('click').on('click', function() {
    let val = $('input[name=rgInflow]:checked').val()
    if (val ==='channel') {
      $('#rgVegInfContainer').show()
    } else {
      $('#rgVegInfContainer').hide()
    }
  })
}

rgView.vegOutDisplay = function () {
  $('input[name=rgOutflow]').off('click').on('click', function() {
    let val = $('input[name=rgOutflow]:checked').val()
    if (val ==='channel') {
      $('#rgVegOutContainer').show()
    } else {
      $('#rgVegOutContainer').hide()
    }
  })
}

rgView.handleSave = function() {
  $('#rgForm').off('submit').on('submit', function(e) {
    e.preventDefault()
    let $val = $('#rg-save').val()
    if ($val === 'save') {
      // controller.rgNew()
      let newRG = rg.makeNew()
      rg.allRGs.push(newRG)
      //renderNew
      //updateUber
      //saveToProject
      //current = new
      viewUtil.clearForm()
    }
  })
}
