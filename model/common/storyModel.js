"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

var Stories = function(stories) {
    this.thumb = stories.thumb;
    this.thumb_title   = stories.thumb_title;
    this.thumb_title = stories.thumb_title;
    this.description  = stories.description;
    this.story_img  = stories.story_img;
   // this.aid  = story.aid;
    //this.created_at = new Date();
  };
  

  Stories.createnewstory = function createnewstory(createnewstorydetails,result) {
      console.log(createnewstorydetails);
    sql.query("INSERT INTO Story set ?", createnewstorydetails, function(err, result) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      }
    });
  };


  Stories.getAllStories = async function getAllStories(req,result) {

    var storyquery = "select * from Stories";
  
 
       sql.query(storyquery,async function(err, res) {
        if (err) {
          console.log("error: ", err);
          result(null, err);
        } else {
         
          for (let i = 0; i < res.length; i++) {
                    console.log(res[i].storyid);
                    var stories = await query("select * from Story where storyid = '"+res[i].storyid+"'");
                    
                    
                    res[i].stories= stories;
            }

          let resobj = {
            success: true,
            status:true,
            result: res
          };
          result(null, resobj);
        }
      });


  //   if (res) {
      
  //       // for (let i = 0; i < res.length; i++) {
  //       //   console.log(res[i].storyid);
  //       //   const storylist = await query("select * from Story where storyid = '"+res[i].storyid+"'");
          
  //       // //  res.push(storylist);
  //       // }
  //       let sucobj = true;
  //       let resobj = {
  //         success: sucobj,
  //         status: true,
  //         result: res
  //       };

  //       // result(null, resobj);
  //       // let resobj = {  
  //       //   success: true,
  //       //   status:true,
  //       //   result:res
    
  //       //   }; 
    
  //      result(null, resobj);
  //   }else{

  //     let resobj = {  
  //     success: true,
  //     status:false,
  //     message:megobj, 

  //     }; 

  //  result(null, resobj);

  //   }
  };
  

  
module.exports = Stories;