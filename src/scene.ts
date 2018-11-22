// three.js
import * as THREE from 'three'
import * as FBXLoader from 'three-fbx-loader'
import { Booth } from './booth'

export class Scene extends THREE.Scene {
    private rectLight: any;
    private rectLightMesh: any;
    constructor() {
        super();

        const sceneRadius = 100;
        // add axis to the scene
        let axis = new THREE.AxesHelper(20)
        // this.add(axis);

        this.background = new THREE.Color( 0x222222 );

        //this.add( new THREE.GridHelper( 100, 100 ) );

        // add lights
        let light = new THREE.DirectionalLight(0xffffff, 0.7)
        light.position.set(100, 100, 100)
        this.add(light)


        let ambient = new THREE.HemisphereLight( 0xbbbbff, 0x886666, 0.75 );
        ambient.position.set( -0.5, 0.75, -1 );
        this.add( ambient );

        // Add sky base 
        var geometry = new THREE.SphereBufferGeometry(sceneRadius,32,32, Math.PI );

        // invert the geometry on the x-axis so that all of the faces point inward
        geometry.scale( - 1, 1, 1 );
        var material = new THREE.MeshBasicMaterial( {
            map: new THREE.TextureLoader().load( '../assets/textures/sky.jpg' ) // equirectangular image
        } );
        // material.side = THREE.BackSide;
        var mesh = new THREE.Mesh( geometry, material );
        mesh.translateY(18);
        this.add( mesh );

        // Add ground
        const groundGeometry = new THREE.BoxGeometry(120, 0.5, 120);
        // let groundMaterial = new THREE.MeshLambertMaterial( {color: 'gray', transparent: true} );
        var floorMaterial = new THREE.MeshStandardMaterial( { color: 0x808080, roughness: 0, metalness: 0 } );
        let groundMesh = new THREE.Mesh( groundGeometry, floorMaterial );
        // groundMesh.translateY(-0.5);
        groundMesh.name = "ground";
        this.add(groundMesh);

        this.addStage();
        this.addDJBooth();
        this.addBackgroundScreen();
    }

    addStage() {
        const stage = new THREE.BoxGeometry(30, 5, 30);
        var stageMaterial = new THREE.MeshStandardMaterial( { color: 0x808080, roughness: 1, metalness: 0 } );
        let stageMesh = new THREE.Mesh( stage, stageMaterial );
        stageMesh.position.set(-26, 0, 0);
        this.add(stageMesh);
    }

    addBackgroundScreen() {
        var width = 80;
        var height = 40;
        var intensity = 0.1;
        // @ts-ignore: Unreachable code error
        this.rectLight = new THREE.RectAreaLight( 0xffffff, intensity,  width, height );
        this.rectLight.position.set( -30, 5, 0 );
        this.rectLight.lookAt( 0, 5, 0 );
        this.add( this.rectLight )
        // @ts-ignore: Unreachable code error
        var rectLightHelper = new THREE.RectAreaLightHelper( this.rectLight );
        this.add( rectLightHelper );

        this.rectLightMesh = new THREE.Mesh( new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial() );
        this.rectLightMesh.scale.x = this.rectLight.width;
        this.rectLightMesh.scale.y = this.rectLight.height;
        this.rectLight.add( this.rectLightMesh );
        var rectLightMeshBack = new THREE.Mesh( new THREE.PlaneBufferGeometry(), new THREE.MeshBasicMaterial( { color: 0x080808 } ) );
        rectLightMeshBack.rotation.y = Math.PI;
        this.rectLightMesh.add( rectLightMeshBack );
    }

    updateLightIntensity(val) {
        if (val > 0.1) {
            this.rectLight.intensity = val;
            this.rectLightMesh.material.color.copy( this.rectLight.color ).multiplyScalar( this.rectLight.intensity );
        }
    }

    importStaticFBXModel(path) {

        const loader = new FBXLoader();
        loader.load(path, group => {
            
            console.log(group);

            // Iterate model and assign colors
            group.children.forEach((child) => {
                if (child.name == 'scenModel') {
                    child.material.color = new THREE.Color(0.5, 0.5, 0.5);
                    /*
                    child.children.forEach((grandChild) => {
                        grandChild.material.color = new THREE.Color(0.3, 0.3, 0.3);
                    });
                    */
                // Ground
                } else if (child.name == 'markModel') {
                    // Create material with bump mapping
                    var texture = new THREE.TextureLoader().load('../assets/textures/grass.jpg');
                    child.material = new THREE.MeshPhongMaterial();

                    child.material.bumpMap = texture;
                    child.material.bumpScale = 50;
                    child.material.shininess = 5;
                    child.material.color = new THREE.Color(0, 0.1, 0);
                }
                // Small trees
                else if (child.name.includes('stam')) {
                    let crown = child.children[0];
                    child.material.color = new THREE.Color(77/255, 38/255, 0);
                    crown.material.color = new THREE.Color(0, 0.8, 0);
                }
                // Big trees
                else if (child.name == 'big_treeModel' || child.name == 'stort_trdModel') {
                    let treeBase = child.children[0];
                    child.material.color = new THREE.Color(0, 0.8, 0);
                    treeBase.material.color = new THREE.Color(77/255, 38/255, 0);
                }
            });

            group.scale.set(0.1,0.1,0.1);
            group.rotateY(0.16973888889 * Math.PI);
            this.add(group);
        });
    }

    addDJBooth = () => {
        // Not working properly
        let DjTable = new Booth();
        DjTable.position.set(-20, 3, 0);
        //DjTable.position.set(-5, 4, 0);
        this.add( DjTable );
    }

}