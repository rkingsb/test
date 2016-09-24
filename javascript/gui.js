WorldMorph.prototype.fillPage = function(){
    var pos = getDocumentPositionOf(this.worldCanvas),
        clientHeight = window.innerHeight,
        clientWidth = window.innerWidth,
        myself = this;

    if (pos.x > 0) {
        this.worldCanvas.style.position = "absolute";
        this.worldCanvas.style.left = "0px";
        pos.x = 0;
    }
    if (pos.y > 0) {
        this.worldCanvas.style.position = "absolute";
        this.worldCanvas.style.top = "0px";
        pos.y = 0;
    }
    if (document.documentElement.scrollTop) {
        // scrolled down b/c of viewport scaling
        clientHeight = document.documentElement.clientHeight;
    }
    if (document.documentElement.scrollLeft) {
        // scrolled left b/c of viewport scaling
        clientWidth = document.documentElement.clientWidth;
    }
    if (this.worldCanvas.width !== clientWidth-dataTableWidth) {
        this.worldCanvas.width = clientWidth-dataTableWidth;
        this.setWidth(clientWidth-dataTableWidth);
    }
    if (this.worldCanvas.height !== clientHeight) {
        this.worldCanvas.height = clientHeight;
        this.setHeight(clientHeight);
    }
    this.children.forEach(function (child) {
        if (child.reactToWorldResize) {
            child.reactToWorldResize(myself.bounds.copy());
        }
    });
};

var GuiMorph;
GuiMorph.prototype = new Morph();
GuiMorph.prototype.constructor = GuiMorph;
GuiMorph.uber = Morph.prototype;
function GuiMorph(){this.init()}
GuiMorph.prototype.init = function(){
    this.table_result = "table_result";
    this.table_data = "table_data";
    this.topMenu = null;
    this.operatorsMenu = null;
    this.dataSetMenu = null;
    this.autoFill = true;
    this.query_sandbox = null;
    GuiMorph.uber.init.call(this);
};

GuiMorph.prototype.startInWorld = function(world){
    this.buildGUI();
    world.add(this);
    this.reactToWorldResize(world.bounds);
};
GuiMorph.prototype.buildGUI = function(){
    this.createTopMenu();
    this.createOperatorsMenu();
    this.createDataSetsMenu();
    this.createQueryBuilderMenu();
    this.createBottomPanel();
};
GuiMorph.prototype.createTopMenu = function(){
    var myself = this;
    this.topMenu = new Morph();
    this.topMenu.acceptsDrops = true;
    this.topMenu.drawNew = function(){
        this.image = newCanvas(this.extent());
        var context = this.image.getContext('2d');
        context.fillStyle = 'white';
        context.fillRect(0, 0, this.width(), this.height());
    };
    this.topMenu.reactToDropOf = function(aMorph, hand){
        aMorph.destroy();
        var script = myself.sandbox_script;
        script.queryUpdate();
    };
    this.logo = new Morph();
    this.logo.setPosition(new Point(3, 3));
    this.logo.drawNew = function(){
        console.log('logo:drawNew');
        this.image = newCanvas(this.extent());
        var context = this.image.getContext('2d'), radius=20;
        drawCircle(context, radius, radius, radius, 'orange');
        drawOpRectangle(context, radius, radius*2, 10, 15, 140, 35, 'orange');
        var db = new StringMorph("DB", 30, null, true);
        db.setFullCenter(new Point(this.left()+74, this.center().y));
        var snap = new StringMorph("Snap", 30, null, false, true, null, null, null, 'Cornflowerblue');
        snap.setPosition(new Point(db.right(), db.top()));
        this.add(db);
        this.add(snap);
    };
    this.logo.setExtent(new Point(190, 40));
    this.topMenu.add(this.logo);
    //this.settingsbutton = new SettingsButtonMorph();
    //this.topMenu.add(this.settingsbutton);

    button = new PushButtonMorph(
        this,
        "importTable",
        new SymbolMorph('importTable', 25),
        null,
        "Import Data Set"
    );
    button.corner = 0;
    button.labelMinExtent = new Point(25, 25);
    button.padding = 1;
    button.labelShadowOffset = new Point(-1, -1);
    button.drawNew();
    button.fixLayout();
    button.silentSetPosition(new Point(500, 7));
    importTableButton = button;
    this.topMenu.add(importTableButton);
    this.topMenu.importTableButton = importTableButton;

    button = new PushButtonMorph(
        this,
        "selectQuery",
        new SymbolMorph('importQuery', 25),
        null,
        "Import Query"
    );
    button.corner = 0;
    button.labelMinExtent = new Point(25, 25);
    button.padding = 1;
    button.labelShadowOffset = new Point(-1, -1);
    button.drawNew();
    button.fixLayout();
    button.silentSetPosition(new Point(500, 7));
    importQueryButton = button;
    this.topMenu.add(importQueryButton);
    this.topMenu.importQueryButton = importQueryButton;

    button = new PushButtonMorph(
     this,
     null,
     new SymbolMorph('save', 25),
     null,
     "Save Query"
     );
     button.corner = 0;
     button.labelMinExtent = new Point(25, 25);
     button.padding = 0;
     button.labelShadowOffset = new Point(-1, -1);
     button.drawNew();
     button.fixLayout();
     button.silentSetPosition(new Point(500, 7));
     button.mouseClickLeft = function(){
         var topParent = this.parentThatIsA(GuiMorph).sandbox_script.children[0];
         if(topParent != null){
             topParent.saveQuery();
         }else{
             alert("You have no query to save.");
         }
     }
     saveButton = button;
     this.topMenu.add(saveButton);
     this.topMenu.saveButton = saveButton;

     button = new PushButtonMorph(
     this,
     null,
     new SymbolMorph('view', 25),
     null,
     "Create View"
     );
     button.corner = 0;
     button.labelMinExtent = new Point(25, 25);
     button.padding = 1;
     button.labelShadowOffset = new Point(-1, -1);
     button.drawNew();
     button.fixLayout();
     button.silentSetPosition(new Point(500, 7));
     button.mouseClickLeft = function(){
         var anyBlock = this.parentThatIsA(GuiMorph).sandbox_script.children[0];
         if(anyBlock != null){
             anyBlock.createView(true);
         }
     }
     viewButton = button;
     this.topMenu.add(viewButton);
     this.topMenu.viewButton = viewButton;

    this.add(this.topMenu);
};
GuiMorph.prototype.createOperatorsMenu = function(){
    this.operatorsMenu = new ScrollFrameMorph();
    var myself = this;
    this.operatorsMenu.contents.reactToDropOf = function(droppedMorph, hand){
        droppedMorph.destroy();
        var script = myself.sandbox_script;
        script.queryUpdate();
    };
    this.operatorsMenu.color = 'lightblue';
    var title_bar = new Morph();
    title_bar.color = 'lightblue';
    title_bar.setExtent(new Point(185, 15));
    var title = new StringMorph("Operators", 15, null, true, null, null, null, null, 'black');
    title.setCenter(new Point(100, 6));
    title_bar.add(title);
    this.operatorsMenu.add(title_bar);
    var x_pad = 3, y_pos = this.operatorsMenu.top()+15;
    var opSelect = new OperatorMorph('Select', 'Select', 'Attr OP Value', 'OrangeRed');
    opSelect.silentSetPosition(new Point(x_pad, y_pos));
    this.operatorsMenu.addContents(opSelect);
    y_pos += 125;
    var proj = new OperatorMorph('Project', 'Project', 'Attrbs', 'blue');
    proj.silentSetPosition(new Point(x_pad, y_pos));
    this.operatorsMenu.addContents(proj);
    y_pos += 125;
    var groupby = new OperatorGroupByMorph('Group', 'GroupBy', 'GroupBy|out', 'green');
    groupby.silentSetPosition(new Point(x_pad, y_pos));
    this.operatorsMenu.addContents(groupby);
    y_pos += 125;
    var rename = new OperatorRenameMorph('Rename', 'Rename', 'Attrb Value', 'LightSlateGrey');
//    var rename = new OperatorMorph('Rename', 'Rename', 'Attrb Value', 'LightSlateGrey');
    rename.silentSetPosition(new Point(x_pad, y_pos));
    this.operatorsMenu.addContents(rename);
    y_pos += 125;
    var join = new OperatorJoinMorph("Natural", 'CornflowerBlue', 'NaturalJoin');
    join.silentSetPosition(new Point(x_pad, y_pos));
    this.operatorsMenu.addContents(join);
    y_pos += 125;
    var theta = new OperatorThetaJoinMorph('ThetaJoin');
    theta.setPosition(new Point(x_pad, y_pos));
    this.operatorsMenu.addContents(theta);//
    y_pos += 125;
    var product = new OperatorJoinMorph('Cross', 'Black', 'ProductJoin');
    product.setPosition(new Point(x_pad, y_pos));
    this.operatorsMenu.addContents(product);
    y_pos += 125;
    var union = new OperatorUnionMorph('Union', 'DarkOliveGreen', 'Union');
    union.setPosition(new Point(x_pad, y_pos));
    this.operatorsMenu.addContents(union);
    y_pos += 125;
    var intersection = new OperatorUnionMorph('Intersection', 'Chocolate', 'Intersection');
    intersection.setPosition(new Point(x_pad, y_pos));
    this.operatorsMenu.addContents(intersection);
    y_pos += 125;
    var difference = new OperatorUnionMorph('Difference', 'LightSeaGreen', 'Difference');
//    Greek capital letter theta	&Theta;	&#920;	&#x398;
//    var difference = new OperatorUnionMorph('Difference', 'LightSeaGreen', 'Difference');
    difference.setPosition(new Point(x_pad, y_pos));
    this.operatorsMenu.addContents(difference);

    this.add(this.operatorsMenu);
};
GuiMorph.prototype.createDataSetsMenu = function(){
    this.dataSetMenu = new ScrollFrameMorph();
    var myself = this;
    this.dataSetMenu.contents.reactToDropOf = function(droppedMorph, hand){
        droppedMorph.destroy();
        var script = myself.sandbox_script;
        script.queryUpdate();
    };
    this.dataSetMenu.color = 'lightcyan';
    var title_bar = new Morph();
    title_bar.color = 'lightcyan';
    title_bar.setExtent(new Point(185, 15));
    var title = new StringMorph("Data Sets", 15, null, true, null, null, null, null, 'black');
    title.setCenter(new Point(100, 6));
    title_bar.add(title);
    this.dataSetMenu.add(title_bar);

    function load_data(data){
        var table = new DataSetBlockMorph(data);
        myself.dataSetMenu.addContents2(table);
    }
    $.getJSON('json/students.json', function(data){load_data(data)});
    $.getJSON('json/courses.json', function(data){load_data(data)});
    $.getJSON('json/professors.json', function(data){load_data(data)});
    $.getJSON('json/course_student.json', function(data){load_data(data)});
    $.getJSON('json/course_professor.json', function(data){load_data(data)});
    $.getJSON('json/setA.json', function(data){load_data(data)});
    $.getJSON('json/setB.json', function(data){load_data(data)});
    $.getJSON('json/setC.json', function(data){load_data(data)});

    this.add(this.dataSetMenu);
};
GuiMorph.prototype.createQueryBuilderMenu = function(){
    this.sandbox_script = new ScriptMorph();
    this.query_sandbox = new ScrollFrameMorph(this.sandbox_script);
    this.sandbox_script.scrollFrame = this.query_sandbox;
    this.sandbox_buttons = {};
    this.sandbox_buttons['title'] = new StringMorph("Query", 15, null, true);
    this.query_sandbox.add(this.sandbox_buttons['title']);
//    this.sandbox_buttons['run_query'] = new RunQueryMorph();
//    this.query_sandbox.add(this.sandbox_buttons['run_query']);
//    this.sandbox_buttons['zoom_in'] = new ZoomMorph("in");
//    this.query_sandbox.add(this.sandbox_buttons['zoom_in']);
//    this.sandbox_buttons['zoom_out'] = new ZoomMorph("out");
//    this.query_sandbox.add(this.sandbox_buttons['zoom_out']);

    this.add(this.query_sandbox);
};
GuiMorph.prototype.createBottomPanel = function(){
    this.relational_algebra = new ScrollFrameMorph();
    var myself = this;
    this.relational_algebra.contents.reactToDropOf = function(aMorph, hand){
        aMorph.destroy();
        var script = myself.sandbox_script;
        script.queryUpdate();
    };
    this.textbox = new TextMorph('Relation Algebra Expression:', 15, null, null, null, null, null);
//    this.textbox.isEditable = true;
    this.relational_algebra.addContents(this.textbox);
    this.relational_algebra.setColor(new Color(240, 240, 240));
    this.add(this.relational_algebra);
};
GuiMorph.prototype.fixLayout = function(){
    var panel_width = 223;
    var ra_height = 100; // relational algebra box, height
    Morph.prototype.trackChanges = false;
    this.topMenu.setExtent(new Point(this.right(), 46));
    this.topMenu.importTableButton.silentSetPosition(new Point(this.topMenu.right() - 215, 10));
    this.topMenu.importQueryButton.silentSetPosition(new Point(this.topMenu.right() - 165, 10));
    this.topMenu.saveButton.silentSetPosition(new Point(this.topMenu.right() - 115, 10));
    this.topMenu.viewButton.silentSetPosition(new Point(this.topMenu.right() - 80, 10));
//    this.settingsbutton.setPosition(new Point(this.topMenu.right()-50, 3));
    this.operatorsMenu.silentSetPosition(new Point(0, this.topMenu.bottom()));
    this.operatorsMenu.setExtent(new Point(panel_width, (this.bottom()-this.topMenu.bottom()) *.75));
    this.dataSetMenu.silentSetPosition(new Point(0, this.operatorsMenu.bottom()));
    this.dataSetMenu.setExtent(new Point(panel_width, this.bottom()-this.operatorsMenu.bottom()));
//    this.dataSetMenu.contents.adjustBounds();
    this.query_sandbox.silentSetPosition(new Point(panel_width, this.topMenu.bottom()));
    this.query_sandbox.setExtent(new Point(this.right()-panel_width, this.bottom()-this.topMenu.bottom()-ra_height));
    this.sandbox_buttons['title'].setCenter(new Point(this.query_sandbox.left()+this.query_sandbox.width()/2, this.topMenu.bottom()+6));
//    this.sandbox_buttons['run_query'].setPosition(new Point(this.query_sandbox.left()+10, this.topMenu.bottom()+15));
//    this.sandbox_buttons['zoom_in'].setPosition(new Point(this.query_sandbox.left()+75, this.topMenu.bottom()+15));
//    this.sandbox_buttons['zoom_out'].setPosition(new Point(this.query_sandbox.left()+135, this.topMenu.bottom()+15));

    this.relational_algebra.silentSetPosition(new Point(this.query_sandbox.left(), this.query_sandbox.bottom()));
    this.relational_algebra.setExtent(new Point(this.right()-panel_width, this.bottom()-this.query_sandbox.bottom()));
//    console.log()
    this.textbox.maxWidth = this.relational_algebra.width();
    this.textbox.drawNew();
//    this.relational_algebra.children[0].maxWidth = 300;
    Morph.prototype.trackChanges = true;
    this.changed();
};
GuiMorph.prototype.setExtent = function(point){
    var padding = new Point(450, 110), minExt, ext;
//    minExt = padding.add(StageMorph.prototype.dimensions);
//    minExt = padding;
//    ext = point.max(minExt);
    ext = point;
    GuiMorph.uber.setExtent.call(this, ext);
    this.fixLayout();
};
GuiMorph.prototype.reactToWorldResize = function(rect){
    if(this.autoFill){
        console.log(this+'reactToWorldResize');
        this.setPosition(rect.origin);
        this.setExtent(rect.extent());
    }
};
GuiMorph.prototype.droppedText = function(result, name){
    /*
    This is the handler for importing data sets. It will parse the chosen
    text file and add it to the data set panel. The file is essentially a
    csv file but instead of using commas it uses a pipe "|". The first
    line is the name that will appear on the block. The second line contains
    the fields and their types, and all following lines contain pipe delimited
    data, where each row is a record.
     */
    console.log('importing table');
    var dataset = {};
    var lines = result.split('\n');
    // get the name that will be displayed on the block
    dataset['name'] = lines[0];

    // get the field names and types (pipe delimited)
    var temp = lines[1].split(/[\|]+/);

    // hold the column names and the functions to covert to the specified type
    dataset['attributes'] = [];
    var attributes = [];

    // regex for splitting up the column name and type
    var re = /([0-9a-zA-Z\-]+)\(([0-9a-zA-Z]+)\)/;

    // split the column name/type and assign a function to convert the value
    // into the appropriate type, into the right index, so that the column
    // name and function have matching indices
    for (var idx=0; idx < temp.length; idx++){
        var temp2 = re.exec(temp[idx]);
        var attr = temp2[1].toUpperCase();//Modified by Yasin Silva. We convert all the attribute names to uppercase.
        var type_ = temp2[2];
        dataset['attributes'].push(attr);
        if (type_ == 'STRING'){
            attributes.push(function(val){return val})
        }else if(type_ == 'NUMBER'){
            attributes.push(function(val){return parseInt(val, 10)})
        }else if(type_ == 'DOUBLE'){
            attributes.push(function(val){return parseFloat(val)})
        }
    }
    var data = [];
    // iterate through and process all the records
    for (var i=2; i < lines.length; i++){
        var values = lines[i].split(/[\|]+/);
        var entry = {};
        for (var j=0; j < attributes.length; j++){
            entry[dataset['attributes'][j]] = attributes[j](values[j]);
        }
        data.push(entry);
    }
    dataset['data'] = data;

    // create a new block from the data and add it to the data set panel
    var table = new DataSetBlockMorph(dataset);
    this.dataSetMenu.addContents2(table);
};

//start here

GuiMorph.prototype.addDataSetTable = function(result, name, parent){

    var table = new DataSetBlockMorph(result, name, parent);
    this.dataSetMenu.addContents2(table);

};

GuiMorph.prototype.selectQuery = function(){
    var inp = document.createElement('input');
    var myself = this;
    if (myself.filePicker) {
        document.body.removeChild(myself.filePicker);
        myself.filePicker = null;
    }
    inp.type = 'file';
    inp.style.color = "transparent";
    inp.style.backgroundColor = "transparent";
    inp.style.border = "none";
    inp.style.outline = "none";
    inp.style.position = "absolute";
    inp.style.top = "0px";
    inp.style.left = "0px";
    inp.style.width = "0px";
    inp.style.height = "0px";
    var world = this.world();
    inp.addEventListener(
        "change",
        function () {
            document.body.removeChild(inp);
            myself.filePicker = null;
            var reader = new FileReader();
            var result;
            reader.onloadend = function(evt) {
                if (evt.target.readyState == FileReader.DONE) { // DONE == 2
                    result = evt.target.result;
                    myself.parentThatIsA(GuiMorph).importQuery(result);
                }
            };
            reader.readAsText(inp.files.item(0));
            //reader.readAsBinaryString(inp.files.item(0));
        },
        false
    );
    document.body.appendChild(inp);
    myself.filePicker = inp;
    inp.click();
}

GuiMorph.prototype.importQuery = function(json){
    try {
        //this.sandbox_script.children = []; //clear the query canvas
        var myself = this;
        if(json.substring(0,3) == "ï»¿")
            json = json.substring(3);
        var query = JSON.parse(json);
        var morphs = [];
        var data_sets = [];
        var c = 0;
        for (var i = 0; i < query.blocks.length; i++) {
            if (query.blocks[i].operator === "DataSet") {
                data_sets[c] = query.blocks[i].name;
                c++;
            }

        }

        var existingDataSets = [];
        for(var i = 0; i < this.dataSetMenu.children[0].children.length; i++) {
            if(this.dataSetMenu.children[0].children[i].data_set != null)
                existingDataSets.push(this.dataSetMenu.children[0].children[i].data_set.name);
        }
        for(var i = 0; i < data_sets.length; i++){
            var dataSetExist = false;
            for(var j=0; j < existingDataSets.length; j++) {
                if (data_sets[i] == existingDataSets[j])
                    dataSetExist = true;
            }
            if(!dataSetExist){
                function load_data(data){
                    var table = new DataSetBlockMorph(data);
                    myself.dataSetMenu.addContents2(table);
                }
                load_data(query.data_sets[i]);
            }
        }

        var x_pos = 400;
        var y_pos = 65;
        for (var i = 0; i < query.blocks.length; i++) {
            var morph;
            switch (query.blocks[i].operator) {
                case "Select":
                    morph = new OperatorMorph('Select', 'Select', query.blocks[i].fields, 'OrangeRed');;
                    break;
                case "Project":
                    morph = new OperatorMorph('Project', 'Project', query.blocks[i].fields, 'blue');
                    break;
                case "Group":
                    morph = new OperatorGroupByMorph('Group', 'GroupBy', 'GroupBy|out', 'green', query.blocks[i].fields);
                    break;
                case "Rename":
                    morph = new OperatorRenameMorph('Rename', 'Rename', 'Attrb Value', 'LightSlateGrey', query.blocks[i].fields);
                    break;
                case "NaturalJoin":
                    morph = new OperatorJoinMorph("Natural", 'CornflowerBlue', 'NaturalJoin');
                    break;
                case "ThetaJoin":
                    morph = new OperatorThetaJoinMorph('ThetaJoin', query.blocks[i].fields);
                    break;
                case "CrossProduct":
                    morph = new OperatorJoinMorph('Cross', 'Black', 'ProductJoin');
                    break;
                case "Union":
                    morph = new OperatorUnionMorph('Union', 'DarkOliveGreen', 'Union');
                    break;
                case "Intersection":
                    morph = new OperatorUnionMorph('Intersection', 'Chocolate', 'Intersection');
                    break;
                case "Difference":
                    morph = new OperatorUnionMorph('Difference', 'LightSeaGreen', 'Difference');
                    break;
                case "DataSet":
                    var blockName = query.blocks[i].name;
                    for(var j = 0;j < this.dataSetMenu.children[0].children.length; j++){
                        if(this.dataSetMenu.children[0].children[j].children[1].text == blockName) {
                            morph = this.dataSetMenu.children[0].children[j].copy();
                            morph.title = new StringMorph("Table", null, null, true, null,null,null, null, 'white');
                            morph.title.setCenter(morph.position().add(new Point(26,25)));
                            morph.add(morph.title);
                            var data_name = new StringMorph(blockName, null, null, true, null,null,null, null, 'white');
                            data_name.setCenter(morph.position().add(new Point(106,35)));
                            morph.add(data_name);
                            break;
                        }
                    }
                    break;
            }

            morph.isTemplate = false;
            morph.isDraggable = true;
            morphs.push(morph);
        }

        morphs[0].parent = this.sandbox_script;
        morphs[0].silentSetPosition(new Point(x_pos,y_pos));
        x_pos += 3;
        for(var i = 0; i< query.blocks.length; i++){
            var children = query.blocks[i].children.split(",");

            if(children.length > 1){
                y_pos += 100;

                morphs[parseInt(children[0])].parent = morphs[i];
                morphs[parseInt(children[1])].parent = morphs[i];
                morphs[i].addChild(morphs[parseInt(children[0])]);
                morphs[i].addChild(morphs[parseInt(children[1])]);
                morphs[parseInt(children[0])].blockPosition = "bottom_left";
                morphs[parseInt(children[1])].blockPosition = "bottom_right";
                morphs[parseInt(children[0])].silentSetPosition(this.calculatePosition(morphs[i], morphs[parseInt(children[0])]));
                morphs[parseInt(children[1])].silentSetPosition(this.calculatePosition(morphs[i], morphs[parseInt(children[1])]));
            }else if(children[0] != ""){
                y_pos += 100;
                morphs[parseInt(children[0])].parent = morphs[i];
                morphs[i].addChild(morphs[parseInt(children[0])]);
                morphs[parseInt(children[0])].silentSetPosition(this.calculatePosition(morphs[i], morphs[parseInt(children[0])]));
            }
        }

        this.sandbox_script.addChild(morphs[0]);
        this.sandbox_script.reactToDropOf(morphs[0]);
    }catch(err){
        alert("This file is not valid for DBSnap. Or you are using a data set that is not imported.");
    }
};

GuiMorph.prototype.calculatePosition = function(parent, child){
    var x = 0;
    if(child.operator == "DataSet"){
        x += 3;
    }
    else if(child.operator == "Union" || child.operator == "ThetaJoin" || child.operator == "NaturalJoin")
        x -= 72;

    if(child != parent.getChildBlocks()[0])
        x += 144;

    return parent.position().add(new Point(x, 100));
};

GuiMorph.prototype.importMenu = function(){
    var menu,
        myself = this,
        world = this.world(),
        pos = this.topMenu.importButton.bottomLeft();

    menu = new MenuMorph(this, "Select an Option");
    menu.addItem('Import Data Set...', 'importTable');
    menu.addItem('Import Query', 'selectQuery');
    menu.popup(world, pos);
};

GuiMorph.prototype.importTable = function(){
    console.log('import button has been clicked');
    var inp = document.createElement('input');
    var myself = this;
    if (myself.filePicker) {
        document.body.removeChild(myself.filePicker);
        myself.filePicker = null;
    }
    inp.type = 'file';
    inp.style.color = "transparent";
    inp.style.backgroundColor = "transparent";
    inp.style.border = "none";
    inp.style.outline = "none";
    inp.style.position = "absolute";
    inp.style.top = "0px";
    inp.style.left = "0px";
    inp.style.width = "0px";
    inp.style.height = "0px";
    var world = this.world();
    inp.addEventListener(
        "change",
        function () {
            document.body.removeChild(inp);
            myself.filePicker = null;
            world.hand.processDrop(inp.files);
        },
        false
    );
    document.body.appendChild(inp);
    myself.filePicker = inp;
    inp.click();
};


//modifications end here (june, 2nd)

