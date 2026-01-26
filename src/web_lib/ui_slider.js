export class Slider {
    divName = "name";
    min = 1;
    value = 50;
    max = 100;
    slider = null;
    textOutput = null;
    constructor( divName , min , startValue , max ) {
        this.divName = divName;
        this.min = min;
        this.value = startValue;
        this.max = max;
        const div = document.createElement( "div" );
        div.setAttribute( "id" , this.divName );
        div.style.display = "flex";
        div.style.alignItems = "center";
        div.style.gap = "5px";
        div.style.padding = "0px";
        div.style.margin = "0px";
        this.slider = document.createElement( "input" );
        this.slider.setAttribute( "type" , "range" );
        this.slider.setAttribute( "class" , "slider" );
        this.slider.setAttribute( "min" , this.min );
        this.slider.setAttribute( "max" , this.max );
        this.slider.setAttribute( "value" , this.value );
        this.textOutput = document.createElement( "p" );
        this.textOutput.textContent = this.value + " - " + divName;
        this.slider.style.gap = "0px";
        this.slider.style.padding = "0px";
        this.slider.style.margin = "0px";
        this.slider.style.setProperty("--slider-color", "purple");
        this.textOutput.style.gap = "0px";
        this.textOutput.style.padding = "0px";
        this.textOutput.style.margin = "0px";
        this.textOutput.style.color = "white";
        div.appendChild( this.textOutput );
        div.appendChild( this.slider );
        document.getElementById( "slidecontainer" ).appendChild( div );
        this.slider.oninput = () => {
            this.value = parseInt(this.slider.value);
            this.textOutput.textContent = this.value + " - " + divName;
            this.Action();
        }
    } 

    Action( ) {
        console.log( "Implement Action" );
    }
    
}

export class Slider_Radius extends Slider {
    gl = null;
    scene = null;
    constructor( divName , min , startValue , max , gl , scene ) {
        super( divName , min , startValue , max );
        this.gl = gl;
        this.scene = scene;
    }
    Action() {
        this.scene.Search( "planet" ).radius = this.value;
        this.scene.Search( "planet" ).ClearVao( this.gl );
        this.scene.Search( "planet" ).Lathe( this.gl );
        this.scene.Search( "cloud-1" ).SetHeight( this.value );
        this.scene.Search( "cloud-2" ).SetHeight( this.value );
        this.scene.Search( "cloud-3" ).SetHeight( this.value );
    }
}

export class Slider_PointsPerCurve extends Slider_Radius {
    Action() {
        this.scene.Search( "planet" ).pointsPerCurve = this.value;
        this.scene.Search( "planet" ).ClearVao( this.gl );
        this.scene.Search( "planet" ).Lathe( this.gl );
    }
}

export class Slider_Divisions extends Slider_Radius {
    Action() {
        this.scene.Search( "planet" ).divisions = this.value;
        this.scene.Search( "planet" ).ClearVao( this.gl );
        this.scene.Search( "planet" ).Lathe( this.gl );
    }
}

export class Slider_H1 extends Slider_Radius {
    constructor( divName , min , startValue , max , gl , scene ) {
        super( divName , min , startValue , max , gl , scene );
        this.slider.step = 0.0001; 
        this.slider.oninput = () => {
            this.value = parseFloat( this.slider.value );
            this.textOutput.textContent = this.value + " - " + divName;
            this.Action();
        }
    }
    Action() {
        this.scene.Search( "planet" ).h1 = this.value;
        this.scene.Search( "planet" ).ClearVao( this.gl );
        this.scene.Search( "planet" ).AddNoise( this.gl );
    }
}

export class Slider_H2 extends Slider_H1 {
    Action() {
        this.scene.Search( "planet" ).h2 = this.value;
        this.scene.Search( "planet" ).ClearVao( this.gl );
        this.scene.Search( "planet" ).AddNoise( this.gl );
    }
}

export class Slider_H3 extends Slider_H1 {
    Action() {
        this.scene.Search( "planet" ).h3 = this.value;
        this.scene.Search( "planet" ).ClearVao( this.gl );
        this.scene.Search( "planet" ).AddNoise( this.gl );
    }
}

export class Slider_H4 extends Slider_H1 {
    Action() {
        this.scene.Search( "planet" ).h4 = this.value;
        this.scene.Search( "planet" ).ClearVao( this.gl );
        this.scene.Search( "planet" ).AddNoise( this.gl );
    }
}

export class Slider_A1 extends Slider_H1 {
    Action() {
        this.scene.Search( "planet" ).a1 = this.value;
        this.scene.Search( "planet" ).ClearVao( this.gl );
        this.scene.Search( "planet" ).AddNoise( this.gl );
    }
}

export class Slider_A2 extends Slider_H1 {
    Action() {
        this.scene.Search( "planet" ).a2 = this.value;
        this.scene.Search( "planet" ).ClearVao( this.gl );
        this.scene.Search( "planet" ).AddNoise( this.gl );
    }
}

export class Slider_A3 extends Slider_H1 {
    Action() {
        this.scene.Search( "planet" ).a3 = this.value;
        this.scene.Search( "planet" ).ClearVao( this.gl );
        this.scene.Search( "planet" ).AddNoise( this.gl );
    }
}

export class Slider_A4 extends Slider_H1 {
    Action() {
        this.scene.Search( "planet" ).a4 = this.value;
        this.scene.Search( "planet" ).ClearVao( this.gl );
        this.scene.Search( "planet" ).AddNoise( this.gl );
    }
}

export class Slider_F1 extends Slider_H1 {
    Action() {
        this.scene.Search( "planet" ).f1 = this.value;
        this.scene.Search( "planet" ).ClearVao( this.gl );
        this.scene.Search( "planet" ).AddNoise( this.gl );
    }
}

export class Slider_F2 extends Slider_H1 {
    Action() {
        this.scene.Search( "planet" ).f2 = this.value;
        this.scene.Search( "planet" ).ClearVao( this.gl );
        this.scene.Search( "planet" ).AddNoise( this.gl );
    }
}

export class Slider_F3 extends Slider_H1 {
    Action() {
        this.scene.Search( "planet" ).f3 = this.value;
        this.scene.Search( "planet" ).ClearVao( this.gl );
        this.scene.Search( "planet" ).AddNoise( this.gl );
    }
}

export class Slider_F4 extends Slider_H1 {
    Action() {
        this.scene.Search( "planet" ).f4 = this.value;
        this.scene.Search( "planet" ).ClearVao( this.gl );
        this.scene.Search( "planet" ).AddNoise( this.gl );
    }
}