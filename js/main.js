
//todo: add discussions to each proposed and upcoming events

(function(jtm1, $){
  //BEGIN FUNCTIONAL HELPERS ----------------
  var buildMemberList =  function(members){
    var lis =  members.map(function(unit){
      return '<li>' + unit.name + ' <a href="http://www.meetup.com/message/?recipientId=' + unit.id + '">email</a>' + (unit.topics[0] ? " topics: " +  + unit.topics.length +  "<ul>" :"") + (unit.topics[0] ? unit.topics.map(function(topic){return '<li>' +  topic.name + '</li>' }) : []).join("") + (unit.topics[0] ? "</ul>":"") + '</li>'
    })
    return 'Members (click member for topics) <ul>' + lis.join(" ") +  '</ul>'
  }

  var buildjoinedProfileAndMembers = function(joinedProfileAndMember){
    var lis =  joinedProfileAndMember.sort(function(a,b){return b[0].visited - a[0].visited}).map(function(unit){
      return '<li style="list-style-type:decimal;">' + unit[1].name + ' <i>"' + unit[0].answers[0].answer +
        '"</i> <a href="http://www.meetup.com/message/?recipientId=' + unit[1].id + '">email</a>' + (unit[1].topics[0] ? " topics: " + unit[1].topics.length +  '<ul style="display:none;">' :"") +
        (unit[1].topics[0] ? unit[1].topics.map(function(topic){return '<li>' +  topic.name + '</li>' }) : []).join("") + (unit[1].topics[0] ? "</ul>":"") +
        ' visited: ' + new Date(unit[0].visited).toString().split(" ").filter(function(unit, index){return index < 4 && index > 0}).join(" ") + '</li>'
    })
    return 'Members (sorted by last visit) <ul>' + lis.join(" ") +  '</ul>'
  }

  var buildActivityList = function(data){
    var unit_types = ["new_discussion", "new_rsvp", "new_member"]
    var nd = data.results.filter(function(unit){return unit.item_type === unit_types[0]}).map(function(unit){return '<li>' + unit.discussion_body + '</li>'}).join("");
    nd = 'Discussions: <ul>' + nd + '</ul>';
    var nr = data.results.filter(function(unit){return unit.item_type === unit_types[1]}).map(function(unit){return '<li>' + unit.member_name + ": " + unit.event_name + ": " + unit.rsvp_response + " : " + unit.published + '</li>'}).join("");
    nr = 'rsvps: <ul>' + nr + '</ul>';
    var nm = data.results.filter(function(unit){return unit.item_type === unit_types[2]}).map(function(unit){return '<li>' + unit.member_name + ": " + unit.bio + '</li>'}).join("");
    nm = 'new members: <ul>' + nm + '</ul>';
    return nm + '<br/>' + nr + '<br/>'  +  nd
  }

  var buildProposedList = function(data){
    //proposed discussions
    var proposedData = data.results.sort(function(a, b){return b.yes_rsvp_count - a.yes_rsvp_count}).map(function(unit){return '<li><b>' + unit.name + "</b>: " + "rsvp =>" + unit.yes_rsvp_count + '<i>' + unit.description + '</i></li>'}).join("");
    return '<h3>Proposed:</h3> <ul>' + proposedData + '</ul>';
  }

  var buildUpcomingList = function(data){
    //proposed discussions
    var upcomingData = data.results.sort(function(a, b){return b.yes_rsvp_count - a.yes_rsvp_count}).map(function(unit){return '<li><b>' + unit.name + "</b>: " + "rsvp =>" + unit.yes_rsvp_count + '<i>' + unit.description + '</i></li>'}).join("");
    return '<h3>Upcoming: </h3> <ul>' + upcomingData + '</ul>';

  }

  var buildProfilesList = function(data){
    var profileData = data.results.sort(function(a,b){return b.visited - a.visited}).map(function(unit){return '<li><i>' + unit.answers[0].answer + '</i> Last Visit: ' + new Date(unit.visited).toString().split(" ").filter(function(unit, index){return index < 4 && index > 0}).join(" ") + '</li>'}).join("");
    return '</ul>' + profileData + '</ul>'
  }

  //END FUNCTIONAL HELPERS -------------

  var el = "jt-meetup1";

  // todo:
  // event comments call todo
  // $.ajax({dataType: "jsonp", url:"http://api.meetup.com/2/event_comments?event_id=168019442&order=time&show_diffs=True&desc=desc&offset=0&format=json&page=20&key=37221ed576b506f7a73121b36675b51"});
  //var attendance = $.ajax({dataType: "jsonp", url:"https://api.meetup.com/Central-Virginia-Javascript-Enthusiasts-CVJSE/events/159401832/attendance?page=1&key=37221ed576b506f7a73121b36675b51"});
  //var groupInfo = $.ajax({dataType: "jsonp", url:"https://api.meetup.com/Central-Virginia-Javascript-Enthusiasts-CVJSE/boards?page=1&key=37221ed576b506f7a73121b36675b51"})

  // BEGIN PROMISED AJAX CALLS ----------
  jtm1.boards = function(){
    return $.ajax({dataType: "jsonp", url:"https://api.meetup.com/Central-Virginia-Javascript-Enthusiasts-CVJSE/boards/6083632/discussions/168019442?page=1&key=37221ed576b506f7a73121b36675b51"});
  }

  var activity = function(){
    return $.ajax({dataType: "jsonp", url:"https://api.meetup.com/activity?member_id=98488202&format=json&page_start=0&key=37221ed576b506f7a73121b36675b51"});
  }

  var proposed = function(){
    return $.ajax({dataType: "jsonp", url:"http://api.meetup.com/2/events?status=proposed&order=time&limited_events=False&group_urlname=Central-Virginia-Javascript-Enthusiasts-CVJSE&desc=false&offset=0&format=json&page=20&fields=&key=37221ed576b506f7a73121b36675b51"});
  }

  var upcoming = function(){
    return $.ajax({dataType: "jsonp", url:"http://api.meetup.com/2/events?status=upcoming&order=time&limited_events=False&group_urlname=Central-Virginia-Javascript-Enthusiasts-CVJSE&desc=false&offset=0&format=json&page=20&fields=&key=37221ed576b506f7a73121b36675b51"});
  }

  var profiles = function(){
    return $.ajax({dataType: "jsonp", url:"http://api.meetup.com/2/profiles?order=visited&group_urlname=Central-Virginia-Javascript-Enthusiasts-CVJSE&offset=0&format=json&page=200&key=37221ed576b506f7a73121b36675b51"});
  }

//gets all members from cvjs: name, topics, bio, city, status, link (to member profile)
  var members = function(){
    if (!localStorage.getItem("cvjs_members") || (new Date() - new Date(JSON.parse(localStorage.getItem("cvjs_members_cache_date"))) > 86400) ) {
      console.log("fetching..." + (new Date() - new Date(JSON.parse(localStorage.getItem("cvjs_members_cache_date")))))

      localStorage.removeItem("cvjs_members");
      localStorage.removeItem("cvjs_members_cache_date");

      return $.ajax({dataType: "jsonp", url:"http://api.meetup.com/2/members?order=name&group_urlname=Central-Virginia-Javascript-Enthusiasts-CVJSE&offset=0&format=json&page=200&key=37221ed576b506f7a73121b36675b51"})
    }
      else {
      return jtm1.mem = JSON.parse(localStorage.getItem("cvjs_members"));
    }
  }
  // END PROMISED AJAX CALLS ----------

  jtm1.init = (function(){
      $.when(members(), activity(), proposed(), profiles(), upcoming()).then(function(mem, act, prop, prof, upcome){
        if (!localStorage.getItem("cvjs_members")) {
          localStorage.setItem("cvjs_members", JSON.stringify(mem[0].results));
          localStorage.setItem("cvjs_members_cache_date", JSON.stringify(new Date()));
        }
        jtm1.mem = jtm1.mem || mem[0].results;
        jtm1.activities = act[0];
        jtm1.proposed = prop[0];
        jtm1.profiles = prof[0];
        jtm1.upcoming = upcome[0];
        //jtm1.memberHTML = buildMemberList(jtm1.mem);
        //jtm1.profilesHTML = buildProfilesList(third[0]);

        jtm1.joinedProfileAndMember = jtm1.profiles.results.map(function(unit){var ed = jtm1.mem.filter(function(memb){return unit.member_id === memb.id})[0]; return [unit, ed] });

        jtm1.joinedProfileAndMemberHTML = buildjoinedProfileAndMembers(jtm1.joinedProfileAndMember);

        jtm1.activitiesHTML = buildActivityList(act[0]);
        jtm1.proposedHTML = buildProposedList(prop[0]);
        jtm1.upcomingHTML = buildUpcomingList(upcome[0]);
        jtm1.navigationHTML = '<div id="nav_bar" style="display:flex;flex:0 1 0;flex-direction:row;" >' + '<div id="upcoming" class="navItem" style="margin:20px;" >Upcoming</div><div id="proposed" class="navItem" style="margin:20px;">Proposed</div><div id="activities" class="navItem" style="margin:20px;">Activity</div><div id="joinedProfileAndMember" class="navItem" style="margin:20px;">Members</div>' +  '</div>'

        //$('jt-meetup1').html(jtm1.upcomingHTML + jtm1.proposedHTML + jtm1.activitiesHTML + jtm1.joinedProfileAndMemberHTML )
        $('jt-meetup1').html(jtm1.navigationHTML+ jtm1.upcomingHTML )
      })
    //END INIT
  }());

  //END jtm1
}(window.jtm1 = window.jtm1 || {}, jQuery))

$(function(){

  $("body").on("click", 'li', function (evt) {
    var dd = $(this).children("ul");
    if (dd.is(":visible")) {
      dd.slideUp("slow");
    } else {
      $("dd:visible").slideUp("slow");
      dd.slideDown("slow");
    }
  });

  $("body").on("click", '.navItem', function (evt) {
    $('jt-meetup1').html(jtm1.navigationHTML + jtm1[evt.currentTarget.id + "HTML"] )
  });
//END DOCUMENT READY
});

/*
// different join method: sort and use indexes to walk them in sync, probably quite a bit faster than filtering or indexof...not that it matters here.
 jtm1.profiles.results.sort(function(a,b){if (a.member_id > b.member_id)
 return 1;
 if (a.member_id < b.member_id)
 return -1;
 // a must be equal to b
 return 0;}).map(function(unit){return unit.member_id}).join(", ") ===

 jtm1.mem.sort(function(a,b){if (a.id > b.id)
 return 1;
 if (a.id < b.id)
 return -1;
 // a must be equal to b
 return 0;}).map(function(unit){return unit.id}).join(", ")
 */


