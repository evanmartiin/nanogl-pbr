#pragma SLOT version

#pragma SLOT definitions

#if useDerivatives && __VERSION__ != 300
  #extension GL_OES_standard_derivatives : enable
#endif 

#pragma SLOT precision

#if __VERSION__ == 300
  #define IN in
  #define texture2D(a,b) texture( a, b )
#else
  #define IN varying
  #define FragColor gl_FragColor
#endif



#if __VERSION__ == 300
  out vec4 FragColor;
#endif

#pragma SLOT pf


uniform vec3 uCameraPosition;


IN vec2 vTexCoord;
IN vec3 vWorldPosition;

IN mediump vec3 vWorldNormal;


#if HAS_normal && useDerivatives == 0
  IN mediump vec3 vWorldTangent;
  IN mediump vec3 vWorldBitangent;
#endif



// IBL
// ========
uniform sampler2D tEnv;

#if perVertexIrrad
  IN vec3 vIrradiance;
#else
  uniform vec4 uSHCoeffs[7];
  {{ require( "./includes/spherical-harmonics.glsl" )() }}
#endif



// MATH
// =========
#define saturate(x) clamp( x, 0.0, 1.0 )
#define sdot( a, b ) saturate( dot(a,b) )


// INCLUDES
// =========

{{ require( "./includes/ibl.glsl" )() }}
{{ require( "./includes/perturb-normal.glsl" )() }}
{{ require( "./includes/tonemap.glsl" )() }}


// Schlick approx
// [Schlick 1994, "An Inexpensive BRDF Model for Physically-Based Rendering"]
// https://github.com/EpicGames/UnrealEngine/blob/dff3c48be101bb9f84633a733ef79c91c38d9542/Engine/Shaders/BRDF.usf#L168
vec3 F_Schlick( float VoH,vec3 spec,float glo )
{
  float dot = glo*glo * pow( 1.0-VoH, 5.0 );
  #if HAS_fresnel
    return( 1.0 - dot )*spec + dot*fresnel();
  #else
    return( 1.0 - dot )*spec + dot;
  #endif
}



#if HAS_normal
  #define COMPUTE_NORMAL(k) ComputeWorldNormal( normal() )

  vec3 ComputeWorldNormal( vec3 nrmmap ){
    vec3 nrm = normalize( gl_FrontFacing ? vWorldNormal : -vWorldNormal );
    #if useDerivatives
      return normalize( perturbWorldNormalDerivatives( nrm, nrmmap, vTexCoord ) );
    #else
      return normalize( perturbWorldNormal( nrm, nrmmap, vWorldTangent, vWorldBitangent ) );
    #endif
  }

#else
  #define COMPUTE_NORMAL(k) ComputeWorldNormal( )
  vec3 ComputeWorldNormal(){
    return normalize( gl_FrontFacing ? vWorldNormal : -vWorldNormal );
  }
#endif



vec3 ComputeIBLDiffuse( vec3 worldNormal ){
  #if perVertexIrrad
    return vIrradiance;
  #else
    return SampleSH(worldNormal, uSHCoeffs );
  #endif
}


//                MAIN
// ===================

void main( void ){

  #pragma SLOT f

  // -----------
  vec3 worldNormal = COMPUTE_NORMAL();



  // SH Irradiance diffuse coeff
  // -------------

  vec3 diffuseCoef = ComputeIBLDiffuse( worldNormal );


  // IBL reflexion
  // --------------

  vec3 viewDir = normalize( uCameraPosition - vWorldPosition );
  vec3 worldReflect = reflect( -viewDir, worldNormal );
  vec3 specularColor = SpecularIBL( tEnv, worldReflect, 1.0-gloss() );


  #pragma SLOT lightsf


  float NoV = sdot( viewDir, worldNormal );
  vec3 specularSq = specular()*specular();
  specularColor *= F_Schlick( NoV, specularSq, gloss() );


  vec3 alb = albedo();
  #if conserveEnergy
    alb = alb - alb * specular();
  #endif
  vec3 albedoSq = alb*alb;



  #if HAS_occlusion
    diffuseCoef *= occlusion();
  #endif


  #if HAS_cavity
    #ifndef cavityStrength
      #define cavityStrength(k) vec2(1.0)
    #endif
    diffuseCoef   *= cavity() * cavityStrength().r + (1.0-cavityStrength().r);
    specularColor *= cavity() * cavityStrength().g + (1.0-cavityStrength().g);
  #endif


  #if HAS_emissive
    float e = emissive();
    #if HAS_emissiveScale
      e = e * emissiveScale();
    #endif
    diffuseCoef += vec3( e ) * albedo();
  #endif



  FragColor.xyz = diffuseCoef*albedoSq + specularColor;


  EXPOSURE(FragColor.rgb);
  GAMMA_CORRECTION(FragColor.rgb);


  FragColor.a = 1.0;

}