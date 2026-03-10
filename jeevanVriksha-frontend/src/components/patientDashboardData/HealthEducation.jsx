const tips = [

{
title:"Pregnancy Nutrition",
text:"Eat iron rich foods like spinach and lentils."
},

{
title:"Newborn Care",
text:"Exclusive breastfeeding for first 6 months."
},

{
title:"Vaccination",
text:"Ensure all childhood vaccines are completed."
}

]

const HealthEducation = ()=>{

return(

<div className="bg-white p-6 rounded-xl shadow">

<h3 className="font-bold mb-4">Health Education</h3>

{tips.map((t,i)=>(
<div key={i} className="mb-3">
<h4 className="font-semibold">{t.title}</h4>
<p className="text-sm">{t.text}</p>
</div>
))}

</div>

)

}

export default HealthEducation