

import { useEffect, useState } from "react";

import {
    createLead,
    getAllLeads,
    updateLead,
    deleteLead
} from "../utils/leadStorage";


import {
    getDraftByLeadDocId,
    unlinkDraftFromLead,
    getAllDraftsFromFirestore
} from "../utils/quotationStorage";


import {
    getClients,
    createClient,
    updateClient
} from "../utils/clientStorage";


import LeadForm from "../components/LeadForm";




import ClientDetailsModal from "../components/ClientDetailsModal";

import ProposalEditor from "../components/ProposalEditor";

import { generateProposalPdf } from "../components/generateProposalPdf";

import { generateProposalDocx } from "../components/generateProposalDocx";

import {
    createProposal,
    updateProposal,
    uploadProposalDocx
} from "../utils/proposalStorage";








const LEAD_SOURCES = [
    "Website",
    "Instagram",
    "Facebook",
    "WhatsApp",
    "Phone Call",
    "Referral",
    "Direct Office",
    "Existing Client",
    "Email",
    "Other"
];


const LEAD_STATUSES = [
    "New",
    "Contacted",
    "Requirement Received",
    "Supplier Enquiry",
    "Quotation Prepared",
    "Quotation Sent",
    "Follow-up",
    "Confirmed",
    "Lost"
];


const emptyLead = {
    source: "Website",
    sourceDetail: "",
    leadTitle: "",
    name: "",
    mobile: "",
    email: "",

    destination: "",
    preferredMonth: "",
    travelFrom: "",
    travelTo: "",

    adults: 2,
    children: 0,

    budget: "",
    requirement: "",

    campaign: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",

    assignedTo: "",

    status: "New",

   nextFollowUp: "",

notes: "",

clientId: "",
clientDocId: ""
};


const fieldStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "9px 10px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    background: "#fff",
    fontSize: "13px",
    color: "#1f2937",
    outline: "none"
};

const labelStyle = {
    display: "block",
    marginBottom: "5px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#475569"
};



const saveProposalToLibrary = async (
    proposal,
    deliveryChannel = "",
    leadId = "",
    clientId = "",
    userProfile = null,
    onProposalSaved = null
) => {

    if (!proposal) {
        throw new Error(
            "Proposal information is missing."
        );
    }

    try {

        /*
         * Generate DOCX.
         *
         * generateProposalDocx() downloads the DOCX
         * and returns:
         *
         * {
         *     blob,
         *     fileName
         * }
         */
        const docxResult =
            await generateProposalDocx(
                proposal
            );

        if (
            !docxResult?.blob ||
            !docxResult?.fileName
        ) {
            throw new Error(
                "Proposal DOCX could not be generated."
            );
        }

        const now =
            new Date().toISOString();

        const proposalLibraryId =
            proposal?.proposalLibraryId ||
            null;

        /*
         * Preserve the exact AI inputs used
         * to generate this proposal.
         */
        const aiInputs =
            proposal?.aiInputs ||
            {};

        /*
         * Find the Lead connected to this proposal.
         *
         * selectedLead cannot be used here because
         * this function is outside the Lead Details JSX scope.
         */
        const leadDocId =
    leadId || "";

        /*
         * Build the permanent Proposal Library record.
         */
        const proposalData = {

            proposalType:
                proposal?.proposalType ||
                "Lead Proposal",

            proposalTitle:
                proposal?.proposalTitle ||
                "Untitled Proposal",

            destination:
    proposal?.tripOverview?.destination ||
    "",

            nights:
                Number(
                    proposal?.nights || 0
                ),

            days:
                Number(
                    proposal?.days || 0
                ),

            leadId,

            leadDocId,

            clientId,

            aiInputs,

            proposal,

            deliveryStatus:
                proposal?.deliveryStatus ||
                "Not Sent",

            deliveryChannel:
                deliveryChannel ||
                proposal?.deliveryChannel ||
                "",

            sentByUid:
                proposal?.sentByUid ||
                "",

            sentByUsername:
                proposal?.sentByUsername ||
                "",

            sentAt:
                proposal?.sentAt ||
                null,

            updatedAt:
                now,

            createdByUid:
                proposal?.createdByUid ||
                userProfile?.uid ||
                "",

            createdByUsername:
                proposal?.createdByUsername ||
                userProfile?.username ||
                userProfile?.displayName ||
                userProfile?.email ||
                ""
        };

        let savedProposal;

        /*
         * FIRST SAVE
         *
         * No Library ID means this is a new
         * Proposal Library record.
         */
        if (!proposalLibraryId) {

            savedProposal =
                await createProposal(
                    proposalData
                );

        }

        /*
         * EXISTING SAVE
         *
         * Library ID already exists, so update
         * the same record instead of creating
         * a duplicate.
         */
       else {

    const updated =
        await updateProposal(
            proposalLibraryId,
            proposalData
        );

    if (updated) {

        savedProposal = {
            ...proposalData,
            id: proposalLibraryId
        };

    } else {

        savedProposal =
            await createProposal(
                proposalData
            );

    }
}

       

        /*
         * Remember the Proposal Library ID
         * in the working proposal.
         *
         * Future saves will update this same
         * Library record.
         */
        if (onProposalSaved) {

    onProposalSaved(
        current => ({
            ...current,

            proposalLibraryId:
                savedProposal.id,

            deliveryStatus:
                proposalData.deliveryStatus,

            deliveryChannel:
                proposalData.deliveryChannel
        })
    );

}

       return {
    ...savedProposal
};

    } catch (error) {

        console.error(
            "Proposal Library save error:",
            error
        );

        throw error;
    }
};





const buildAIProposalPayload = (inputs) => {
    if (!inputs) return null;

    return {
        customer: inputs.customer || "",
        destination: inputs.destination || "",
        travelMonth: inputs.travelMonth || "",
        duration: inputs.duration || "",

        travellers: {
            adults: Number(inputs.adults) || 0,
            children: Number(inputs.children) || 0
        },

      accommodationAdultPerNight:
    inputs.accommodationAdultPerNight || "",

transferPerDay:
    inputs.transferPerDay || "",

        travelFrom: inputs.travelFrom || "",
        travelTo: inputs.travelTo || "",

        travellerType: inputs.travellerType || "",
        travelTheme: inputs.travelTheme || "",
        themeDetails: inputs.themeDetails || "",

        travelPace: inputs.travelPace || "AI Recommended",
        accommodationPreference:
            inputs.accommodationPreference || "AI Recommended",
        transportPreference:
            inputs.transportPreference || "AI Recommended",

        mustVisit: Array.isArray(inputs.mustVisit)
            ? inputs.mustVisit
            : [],

        specialPreferences: Array.isArray(inputs.specialPreferences)
            ? inputs.specialPreferences
            : [],

        avoidPreferences: Array.isArray(inputs.avoidPreferences)
            ? inputs.avoidPreferences
            : [],

        requirement: inputs.requirement || "",

        planningContext: {
            duration: {
                provided: Boolean(inputs.duration),
                aiMaySuggest: !inputs.duration
            },

            travelWindow: {
                provided: Boolean(inputs.travelMonth),
                aiMaySuggest: !inputs.travelMonth
            },

            route: {
                aiShouldRecommend: true
            },

            entryExit: {
                aiShouldRecommend: true
            },

            nightsDistribution: {
                aiShouldRecommend: true
            },

            seasonSuitability: {
                aiShouldEvaluate: true
            },

            itinerary: {
                aiShouldGenerate: true
            },

            weatherAndClimate: {
                aiShouldInclude: true
            },

            travelTips: {
                aiShouldInclude: true
            },

            packingAdvice: {
                aiShouldInclude: true
            },

            optionalExperiences: {
                aiShouldSuggest: true
            },

          budgetPlanning: {
    provided:
        Boolean(
            inputs.accommodationAdultPerNight ||
            inputs.transferPerDay
        ),

    aiMayExplainPlanning:
        Boolean(
            inputs.accommodationAdultPerNight ||
            inputs.transferPerDay
        ),

    aiMustNotInventPrice: true
}
        }
    };
};



const createAIProposalResultTemplate = () => ({
    customerGreeting: "",

    proposalTitle: "",

    tripOverview: {
        destination: "",
        recommendedTravelWindow: "",
        requestedTravelWindow: "",
        suggestedDuration: "",
        requestedDuration: "",
        travellers: {
            adults: 0,
            children: 0
        },
        travelFrom: "",
        travelTo: ""
    },

    route: {
        recommendedRoute: [],
        entryPoint: "",
        exitPoint: "",
        routeReason: "",
        routeSegments: []
    },

    dayWiseItinerary: [],

    seasonalInformation: {
        season: "",
        weather: "",
        climateNote: "",
        seasonalHighlights: [],
        seasonalAdvisory: ""
    },

    routeAdvisory: "",

    whyThisItinerary: [],

    destinationHighlights: [],

    travelTips: [],

    packingAdvice: [],

    optionalExperiences: [],

    suggestedPace: "",

    packageIncludes: [],

    packageExcludes: [],

    budgetPlanningNote: "",

    finalPricingNote:
        "Final pricing will be confirmed based on availability and the final selection of services."
});



const buildAIProposalPrompt = (payload) => {
    if (!payload) return "";

    return `
You are the travel planning assistant for Orbitz Holidays.

Create a customer-ready travel proposal based on the supplied planning information.

IMPORTANT RULES:

1. Use the supplied destination, traveller information, travel window, budget,
   preferences and requirements as the primary planning inputs.

   1A. The customer-facing proposal must begin with a warm, personal greeting
using the customer's name.

The greeting should feel welcoming and human, for example:

"Dear [Customer Name],
Warm greetings from Orbitz Holidays! ✨"

Follow this with a short, friendly introduction to the proposed journey.

Do not use generic greetings such as "Dear Customer" when a customer name
is available.

Keep the greeting warm, premium and concise. Do not make it overly promotional.

2. If duration is supplied, evaluate whether it is practical for the proposed
   route and season. Do not blindly preserve an impractical route.

3. If duration is not supplied, intelligently suggest a suitable duration based
   on the destination, route feasibility, season, traveller profile, origin,
   budget and requirements.

4. If a travel window/month is supplied, plan around it.

5. If no travel window/month is supplied, recommend an appropriate travel period
   based on seasonality, climate, festivals, nature experiences and the requested
   theme where relevant.

6. Optimize the route rather than blindly following the order in which places
   were entered.

7. Recommend sensible entry and exit points and explain the route logic briefly.

8. Consider:
   - seasonal suitability
   - weather and climate
   - travel time between locations
   - altitude and acclimatization where relevant
   - traveller type
   - requested pace
   - accommodation preference
   - transport preference
   - must-visit places
   - special preferences
   - places or activities to avoid


   8A. DAY-WISE ITINERARY:
    Generate the day-wise itinerary as a concise customer-facing overview,
    not as a detailed operational itinerary.

    For each day:
    - Provide the day number and a short, attractive day title.
    - Keep the description to 1–2 concise lines maximum.
    - Mention only the main destination, activity or sightseeing experience
      for that day.
    - For arrival days, mention arrival plus the main sightseeing or experience
      where appropriate.
    - Focus on what the traveller will experience or explore.
    - Do NOT include hotel or overnight details.
    - Do NOT include meals.
    - Do NOT include vehicle or transfer details.
    - Do NOT include check-in or check-out details.
    - Do NOT include detailed timings or operational instructions.
    - Do NOT expand the day into a detailed DMC-style itinerary.




9. Do not invent current road closures, flight availability, hotel availability,
   permits, festival dates or other live operational information.

10. When information is time-sensitive or current verification is required,
    clearly identify it as something that should be verified before final
    customer communication.

11. Do not invent package pricing.

12. If a budget is supplied, describe it only as a planning consideration.
    Customer-facing wording should use:
    "Planning around a budget of ₹[amount]"

    Never say:
    "your budget"
    "customer budget"
    "indicated budget"

13. If no budget is supplied, do not invent one and omit the budget planning
    note.

14. Package Includes and Package Excludes are suggested planning content only.
    They must not be presented as confirmed supplier services.

15. The proposal is NOT a quotation, invoice or booking confirmation.

16. Do not change Lead status.

16A. REQUIREMENT / NOTES INTERPRETATION:

    Requirement / Notes contains customer-specific information that cannot
    be captured through the other structured Proposal Input fields.

    Treat this field as active customer information when designing the
    final proposal.

    It may contain:
    - specific requirements
    - preferences
    - exclusions
    - special requests
    - priorities
    - flexibility
    - trade-offs
    - route preferences
    - activity preferences
    - accommodation preferences
    - travel or movement preferences
    - any other customer instruction not represented by a dedicated
      structured input field.

    Consider the complete Requirement / Notes content together with all
    other Proposal Input fields.

    Requirement / Notes is supplementary to the structured inputs. Do not
    automatically replace, ignore or contradict an explicitly supplied
    structured input.

    Where Requirement / Notes provides additional guidance that is
    compatible with the structured inputs, incorporate that guidance into
    the final itinerary.

    If Requirement / Notes gives the customer flexibility to modify,
    remove, replace or rearrange one or more proposed destinations,
    activities or itinerary elements, Terra may use that flexibility when
    designing the most practical final itinerary.

    Example:

    Destination:
    Shimla, Kullu, Manali

    Must Visit:
    Spiti Valley

    Requirement / Notes:
    Customer is willing to drop any of the proposed destinations if
    required to include Spiti Valley.

    Interpretation:

    Spiti Valley is an explicit Must Visit requirement.

    Shimla, Kullu and Manali are the initially proposed destinations.

    The Requirement / Notes gives Terra permission to modify, reduce,
    replace or omit one or more of those proposed destinations if that
    produces a more practical itinerary that includes Spiti Valley.

    Do not treat Requirement / Notes as merely descriptive text.

    Use the customer's specific instructions in this field when deciding
    the final route, destination selection, duration, overnight
    distribution, sightseeing and day-wise itinerary.

    If Requirement / Notes contains a genuine contradiction with another
    structured Proposal Input, do not silently ignore either instruction.

    Resolve the situation using the overall customer context when the
    intended preference is clear. If the conflict cannot reasonably be
    resolved, reflect the issue through an appropriate customer-facing
    advisory or recommendation rather than silently discarding the
    customer's information.


17. PLANNING BUDGET:

    The supplied planning budget is an internal planning constraint.

    accommodationAdultPerNight is the target planning amount for CP accommodation per adult per night on a Twin Share basis.

    transferPerDay is the user-supplied planning amount for transfers per itinerary day.

    For accommodation planning:
    - Calculate only using adults.
    - Children must be completely ignored in the accommodation budget calculation.
    - The accommodation planning amount is:
      accommodationAdultPerNight × adults × finalPlanningNights.

    For transfer planning:
    - transferPerDay is already the total planned transfer allocation for
      one itinerary day.
    - Do NOT multiply transferPerDay by the number of adults or children.
    - Calculate the total transfer planning budget as:
      transferPerDay × (finalPlanningNights + 1).

    These supplied amounts are internal planning allocations only.
    Do not display the individual accommodation or transfer rates to the customer.

    These values must NEVER be exposed in the customer-facing proposal.
    Do not mention the adult-per-night rate or child-per-night rate.

    If an adult planning budget is supplied, use it as a primary planning
    constraint when determining the practical accommodation level, route,
    duration, transport approach and overall itinerary.

    If a child planning budget is supplied and children are present, use it
    as the planning constraint for the children.

    Do not invent either planning rate.

18. FINAL PLANNING DURATION AND BUDGET CALCULATION:



    First determine the final practical number of nights for the proposed

    itinerary.



    If the customer supplied a duration and it is practical for the

    destination, route, season, traveller profile and stated customer

    requirements, retain that duration.



    If the supplied duration is not practical for the destination, route,

    season, traveller profile or stated customer requirements, recommend

    a more suitable duration.



    If no duration was supplied, intelligently recommend a suitable

    duration using the destination, traveller profile, Must Visit places,

    Requirement / Notes, season, route practicality and other supplied

    Proposal Input information.



    IMPORTANT:

    accommodationAdultPerNight and transferPerDay are planning rates, not

    a fixed maximum total trip budget.



    Do NOT shorten, simplify, remove or exclude an explicitly requested

    Must Visit place, destination or customer requirement merely because

    including it results in a higher calculated planningBudgetTotal.



    Determine the practical itinerary first based on the customer's

    supplied requirements and preferences.



    After determining the final practical itinerary and finalPlanningNights,

    calculate the planning budget from the resulting itinerary duration.



    Therefore, if additional nights or itinerary days are required to

    properly accommodate the customer's Must Visit places or other

    specific requirements, the finalPlanningNights may increase and the

    calculated planningBudgetTotal must increase accordingly.



    The planning budget is an internal planning calculation based on the

    final itinerary. It is NOT a hard spending ceiling that overrides

    explicit customer requirements.

    Set finalPlanningNights to the final number of nights selected for the
    itinerary.

    The day-wise itinerary MUST match the final planning duration.

    If a planning budget is supplied, calculate:

    Accommodation Planning Budget =
    accommodationAdultPerNight × number of adults × finalPlanningNights

    IMPORTANT:
    Children must be completely ignored in the accommodation planning
    calculation.

    Transfer Planning Budget =
    transferPerDay × (finalPlanningNights + 1)

    Total travellers =
    number of adults + number of children

    planningBudgetTotal =
    Accommodation Planning Budget + Transfer Planning Budget

    Set planningBudgetTotal to this calculated overall planning amount.

    If only an accommodation planning amount is supplied, calculate the
    accommodation planning budget and treat the transfer planning budget
    as zero.

    If only a transfer planning amount is supplied, calculate the transfer
    planning budget and treat the accommodation planning budget as zero.

    If no planning budget is supplied at all, set:

    accommodationPlanningBudget = 0
    transferPlanningBudget = 0
    planningBudgetTotal = 0

    The calculated planningBudgetTotal must be used in the customer-facing
    Budget Planning section.

The Budget Planning section is an important customer-facing section and
should clearly communicate what this planning allocation covers.

When a planning budget is supplied, the Budget Planning note MUST use this
structure:

    Overall Planning Budget: ₹[planningBudgetTotal] for [number of adults] adults and [number of children] children over [finalPlanningNights] nights / [finalPlanningNights + 1] days.

   


    • Accommodation on CP plan (room + breakfast), Twin Share basis
    • Transfers as per the planned itinerary

    This is a planning guide only and is not a quotation or confirmed
    package price. Final pricing will depend on the selected services,
    travel dates and availability.

     Use the actual number of adults and children supplied in the travel requirements.
Do not replace the traveller composition with only the total number of travellers.

Do NOT display the underlying accommodation-per-adult-per-night or
transfer-per-person-per-day rates to the customer.

Do NOT display the separate Accommodation Planning Budget or Transfer
Planning Budget amounts to the customer.

Do NOT present planningBudgetTotal as a confirmed package price,
quotation or booking price.

If no planning budget is supplied, do not invent or estimate a budget and
omit the Budget Planning note.

The supplied accommodationAdultPerNight represents the internal planning
allocation for:

• CP accommodation (room + breakfast)
• Adult accommodation cost on a Twin Share basis

The supplied transferPerDay represents the internal planning
allocation for:

• Planned transfers and practical movement required by the itinerary
• Movement required to visit the sightseeing places included in the
  proposed itinerary

For accommodation planning, children are NOT included in the calculation.
The user may manually adjust the supplied accommodation allocation when
child accommodation arrangements require different planning treatment.

For transfer planning, both adults and children are included as travellers.

The transfer allocation therefore covers the practical movement required to
follow the planned itinerary and visit its sightseeing places.

This planning allocation does NOT include sightseeing entrance fees,
activity charges, or other separately chargeable sightseeing costs unless
explicitly specified in the supplied requirements.

It also does not represent the complete cost of the entire trip.



18A. BUDGET-AWARE ITINERARY AND OVERNIGHT STAY PLANNING:



    The supplied planning allocation should influence how efficiently the

    itinerary is designed, but it is NOT a fixed maximum total trip budget.



    Do NOT simply calculate the planning budget and then generate a generic

    destination itinerary.



    Use the supplied planning rates as planning inputs when determining:



    • The practical route

    • Transfer efficiency

    • The number of hotel changes

    • The overnight stay locations

    • The number of nights in each overnight location

    • Accommodation level

    • Overall itinerary practicality



    Prioritize the customer's explicit Proposal Input information when

    designing the itinerary, including:



    • Explicitly supplied destinations

    • Must Visit places or experiences

    • Customer-supplied duration

    • Requirement / Notes

    • Traveller composition

    • Other specific customer preferences or requirements



    The planning allocation must NOT override, remove or exclude an

    explicitly supplied Must Visit place, destination or customer

    requirement merely because the resulting itinerary produces a higher

    planningBudgetTotal.



    If an explicitly requested place or requirement requires additional

    nights or itinerary days to create a practical itinerary, allow the

    finalPlanningNights to increase where appropriate.



    The resulting planningBudgetTotal must then be recalculated from the

    final itinerary duration.



    Use the planning allocation primarily to optimize the itinerary rather

    than to impose a hard spending ceiling.



    Prefer a geographically efficient and comfortable route.



    Avoid unnecessary backtracking.



    Avoid adding destinations merely to make the itinerary appear richer.



    When several itinerary options satisfy the customer's requirements,

    prefer the option with fewer unnecessary destination changes, fewer

    unnecessary hotel changes, efficient transfers and sensible overnight

    distribution.



    If the planning allocation is relatively constrained, use it to favour

    a simpler and more geographically efficient itinerary where multiple

    reasonable itinerary options are available.



    However, do NOT simplify the itinerary by removing an explicitly

    requested destination, Must Visit place or customer requirement merely

    to reduce the calculated planning amount.



    If Requirement / Notes explicitly gives Terra permission to drop,

    replace, reduce or rearrange a proposed destination or itinerary

    element, that flexibility may be used when creating the final route.



    If the requested duration can remain practical through an efficient

    route and sensible overnight distribution, retain the requested

    duration.



    If the requested duration is not practical for the destination, route,

    season, traveller profile or customer requirements, recommend a more

    suitable duration.



    If no duration was supplied, determine a suitable duration based on the

    destination, Must Visit requirements, Requirement / Notes, traveller

    profile, season and overall route practicality.



    The final itinerary must be internally consistent with the selected

    route, customer requirements and overnight locations.


18B. OVERNIGHT STAY LOCATIONS:

    Determine the practical places where the traveller should stay overnight
    based on the final route and final planning duration.

    Return these locations in the structured field:

    overnightStayLocations

    Each item must contain:

    • location
    • nights

    Example:

    [
        { "location": "Munnar", "nights": 2 },
        { "location": "Thekkady", "nights": 1 },
        { "location": "Alleppey", "nights": 2 },
        { "location": "Kochi", "nights": 1 }
    ]

    The sum of all overnightStayLocations.nights MUST exactly equal
    finalPlanningNights.

    Do not include hotel names.

    Do not invent specific hotels.

    The overnight locations should represent practical places where the
    traveller would stay during the proposed itinerary.

    Avoid unnecessary one-night hotel changes when a longer stay in one
    location would produce a more practical and comfortable itinerary.

    The overnight stay distribution must support the day-wise itinerary.

    The day-wise itinerary must not introduce an overnight destination that
    conflicts with the overnightStayLocations.

    The final route, overnightStayLocations and dayWiseItinerary must therefore
    describe the same trip plan.

18C. DAY-WISE ITINERARY CONSISTENCY:

    The day-wise itinerary MUST contain the correct number of days for the
    final planning duration.

    finalPlanningNights means the number of nights.

    Therefore:

    number of itinerary days = finalPlanningNights + 1

    The itinerary should naturally reflect the overnight stay locations.

    For example, if overnightStayLocations contains:

    Munnar — 2 nights
    Thekkady — 1 night
    Alleppey — 2 nights
    Kochi — 1 night

    the day-wise itinerary should logically reflect those overnight stays
    rather than creating a conflicting sequence.

    Do not mention hotel names.

    Keep the day-wise itinerary concise and customer-facing.

    Do not turn it into a detailed DMC operational itinerary.



    18D. INTERNAL PLANNING-FEASIBILITY CHECK:



    When a planning allocation is supplied, use the supplied planning rates

    to evaluate the practical structure of the proposed itinerary.



    The planning allocation is an internal planning reference. It is NOT a

    fixed maximum total trip budget and must NOT be treated as a hard

    spending ceiling.



    Determine the itinerary based primarily on:



    • Destination requirements

    • Explicitly supplied destinations

    • Must Visit places or experiences

    • Customer-supplied duration

    • Requirement / Notes

    • Traveller profile

    • Season

    • Route practicality

    • Other explicit Proposal Input information



    Use the planning allocation to optimize the practical operation of the

    itinerary, particularly:



    • CP accommodation expectations

    • Transfer efficiency

    • Geographical efficiency

    • Hotel-change frequency

    • Overnight distribution

    • Overall route practicality



    Do NOT remove, omit, replace or shorten an explicitly supplied Must Visit

    place, destination or customer requirement merely because doing so would

    produce a lower planningBudgetTotal.



    If covering the customer's explicit requirements requires additional

    nights or itinerary days, allow the itinerary duration to increase when

    appropriate.



    After the final practical itinerary has been determined, calculate the

    planningBudgetTotal from the resulting finalPlanningNights and

    itinerary days.



    Do NOT invent supplier prices, hotel prices, transport prices or market

    rates in order to prove affordability or feasibility.



    Do NOT claim that the planning allocation guarantees that the final trip

    can be purchased for that amount.



    Do NOT state that an itinerary is "within budget" based on invented

    market prices.



    When multiple practical itinerary options satisfy the customer's

    requirements, prefer the option with:



    • Efficient geographical routing

    • Fewer unnecessary destination changes

    • Fewer unnecessary hotel changes

    • Longer sensible stays where appropriate

    • Efficient transfers

    • Minimal unnecessary backtracking

    • Practical accommodation expectations



    If the planning allocation appears relatively constrained, use it to

    prefer the more efficient option among otherwise suitable itinerary

    alternatives.



    Do NOT use a relatively constrained planning allocation as a reason to

    ignore an explicit customer requirement.



    Requirement / Notes may explicitly provide flexibility to drop, replace,

    reduce or rearrange destinations or itinerary elements. When such

    flexibility is clearly stated, Terra may use it when selecting the most

    practical final itinerary.



    The final route, overnightStayLocations and dayWiseItinerary must remain

    consistent with the final customer requirements and the final practical

    itinerary.





19. STRUCTURED OUTPUT:

    finalPlanningNights must contain only the final number of nights as an
    integer.

    planningBudgetTotal must contain only the calculated overall planning
    budget as a number, without currency symbols or text.

    overnightStayLocations must contain the final overnight stay locations
and their night distribution.

The sum of all overnightStayLocations.nights must exactly equal
finalPlanningNights.

Each overnightStayLocations.nights value must be a positive integer.

Do not include hotel names in overnightStayLocations.



    budgetPlanningNote should explain the overall planning budget in
    customer-friendly language when a planning budget was supplied.

    The note must NOT reveal the underlying adult-per-night or
    child-per-night planning rates.

    Return the proposal using the exact structured fields requested by the
    proposal result schema.

PLANNING INPUT:

${JSON.stringify(payload, null, 2)}

RETURN STRUCTURE:

${JSON.stringify(createAIProposalResultTemplate(), null, 2)}

Return only the structured proposal data. Do not add commentary outside the
requested structure.
`;
};


const generateTestAIProposal = async (payload) => {
    const result = createAIProposalResultTemplate();

    await new Promise(resolve => setTimeout(resolve, 800));

    result.customerGreeting =
    `Dear ${payload.customer || "Guest"},\nWarm greetings from Orbitz Holidays! ✨\n\nHere is your proposed tour itinerary, thoughtfully planned around your travel preferences and the experiences you would like to explore.`;

    result.proposalTitle =
        `${payload.destination || "Your Journey"} Experience`;

    result.tripOverview.destination =
        payload.destination || "";

    result.tripOverview.requestedTravelWindow =
        payload.travelMonth || "";

    result.tripOverview.requestedDuration =
        payload.duration || "";

    result.tripOverview.suggestedDuration =
        payload.duration || "AI Recommended";

    result.tripOverview.travellers = {
        adults: payload.travellers?.adults || 0,
        children: payload.travellers?.children || 0
    };

    result.tripOverview.travelFrom =
        payload.travelFrom || "";

    result.tripOverview.travelTo =
        payload.travelTo || "";

   result.route.recommendedRoute = [
    "Kochi",
    "Munnar",
    "Thekkady",
    "Alleppey",
    "Kochi"
];

result.route.entryPoint = "Kochi";
result.route.exitPoint = "Kochi";

result.route.routeReason =
    "A practical Kerala circuit combining hill landscapes, wildlife, backwater experiences and a smooth return to Kochi.";

result.route.routeSegments = [
    "Kochi → Munnar",
    "Munnar → Thekkady",
    "Thekkady → Alleppey",
    "Alleppey → Kochi"
];

   result.seasonalInformation.season =
    payload.travelMonth ||
    "AI Recommended based on destination and travel preferences";

result.seasonalInformation.weather =
    "Expected weather conditions will be considered when planning sightseeing and the daily route.";

result.seasonalInformation.climateNote =
    "Climate and temperature patterns will be considered to keep the proposed journey comfortable and practical.";

result.seasonalInformation.seasonalHighlights = [
    "Suitable experiences for the proposed travel period",
    "Seasonal opportunities aligned with the destination"
];

result.seasonalInformation.seasonalAdvisory =
    "Seasonal conditions should be verified before final customer communication if current conditions may affect the journey.";


    result.destinationHighlights = [
    "Tokyo city experiences",
    "Mount Fuji views",
    "Traditional Kyoto heritage",
    "Seasonal Sakura scenery"
];

result.travelTips = [
    "Allow comfortable travel time between destinations.",
    "Carry suitable clothing according to the season.",
    "Keep some flexibility for weather-dependent sightseeing."
];


result.packingAdvice = [
    "Comfortable walking shoes",
    "Weather-appropriate clothing",
    "Travel essentials and personal medication"
];

result.optionalExperiences = [
    "Traditional cultural experience",
    "Local food experience",
    "Scenic photography stop"
];


result.packageIncludes = [
    "Airport / station transfers",
    "Accommodation as selected",
    "Sightseeing as per final itinerary"
];

result.packageExcludes = [
    "International / domestic flights unless selected",
    "Personal expenses",
    "Travel insurance"
];




    result.suggestedPace =
        payload.travelPace || "AI Recommended";

    result.budgetPlanningNote = payload.budget
        ? `Planning around a budget of ₹${payload.budget}`
        : "";

 result.dayWiseItinerary = [
    {
        day: 1,
        title: "Arrival & Local Exploration",
        description:
            "Arrive at the destination and begin exploring its main local highlights."
    },
    {
        day: 2,
        title: "Scenic Exploration",
        description:
            "Discover the destination's key sightseeing experiences and scenic attractions."
    },
    {
        day: 3,
        title: "Culture & Experiences",
        description:
            "Explore important cultural landmarks and enjoy the destination's signature experiences."
    },
    {
        day: 4,
        title: "Leisure & Discovery",
        description:
            "Enjoy a relaxed day discovering more of the destination at a comfortable pace."
    },
    {
        day: 5,
        title: "Departure",
        description:
            "Conclude the journey with a final local experience before departure."
    }
];

    result.whyThisItinerary = [
        "Designed around the supplied travel preferences.",
        "Route and duration will be refined according to destination feasibility and season."
    ];

    return result;
};



function cleanProposalText(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/\r\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

function cleanWhatsAppTitle(value) {
    return cleanProposalText(value)
        .replace(/\\/g, "")
        .replace(/\*/g, "")
        .trim();
}

function addWhatsAppSection(lines, title, content) {
    const text = cleanProposalText(content);

    if (!text) return;

    const cleanTitle = cleanWhatsAppTitle(title);

    lines.push(`*${cleanTitle}*`);
    lines.push(text);
    lines.push("");
}

function addWhatsAppList(lines, title, items) {
    if (!Array.isArray(items) || !items.length) {
        return;
    }

    const validItems = items
        .map(item => cleanProposalText(item))
        .filter(Boolean);

    if (!validItems.length) {
        return;
    }

    const cleanTitle = cleanWhatsAppTitle(title);

    lines.push(`*${cleanTitle}*`);

    validItems.forEach(item => {
        lines.push(`• ${item}`);
    });

    lines.push("");
}

function buildProposalWhatsAppMessage(proposal) {
    if (!proposal) return "";

    // Build emoji characters programmatically.
    // This avoids source-file encoding problems.
    const E = {
        sparkle: String.fromCodePoint(0x2728),
        location: String.fromCodePoint(0x1F4CD),
        calendar: String.fromCodePoint(0x1F5D3),
        stopwatch: String.fromCodePoint(0x23F1),
        people: String.fromCodePoint(0x1F465),
        airplaneUp: String.fromCodePoint(0x1F6EB),
        airplaneDown: String.fromCodePoint(0x1F6EC),
        compass: String.fromCodePoint(0x1F9ED),
        warning: String.fromCodePoint(0x26A0),
        walking: String.fromCodePoint(0x1F6B6),
        date: String.fromCodePoint(0x1F4C5),
        star: String.fromCodePoint(0x2B50),
        sun: String.fromCodePoint(0x1F324),
        leaf: String.fromCodePoint(0x1F33F),
        thermometer: String.fromCodePoint(0x1F321),
        cloud: String.fromCodePoint(0x2601),
        idea: String.fromCodePoint(0x1F4A1),
        bag: String.fromCodePoint(0x1F392),
        check: String.fromCodePoint(0x2705),
        cross: String.fromCodePoint(0x274C),
        money: String.fromCodePoint(0x1F4B0),
        message: String.fromCodePoint(0x1F4AC)
    };

    const clean = (value) => {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/\r\n/g, "\n")
        .replace(/\uFFFD/g, "")
        .replace(/\\/g, "")
        .replace(/\*/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
};

const title = (value) => {
    return clean(value).trim();
};


    const section = (
        lines,
        heading,
        content
    ) => {
        const text = clean(content);

        if (!text) return;

        lines.push(`*${title(heading)}*`);
        lines.push(text);
        lines.push("");
    };

    const list = (
        lines,
        heading,
        items
    ) => {
        if (
            !Array.isArray(items) ||
            !items.length
        ) {
            return;
        }

        const validItems = items
            .map(item => clean(item))
            .filter(Boolean);

        if (!validItems.length) {
            return;
        }

        lines.push(`*${title(heading)}*`);

        validItems.forEach(item => {
            lines.push(`• ${item}`);
        });

        lines.push("");
    };

    const lines = [];

    // -----------------------------------------
    // GREETING
    // -----------------------------------------

    let greeting = clean(
        proposal.customerGreeting
    );

    if (greeting) {
        // If the AI greeting contains a replacement
        // character where the sparkle should be,
        // restore the sparkle.
        greeting = greeting.replace(
            /\uFFFD/g,
            E.sparkle
        );

        lines.push(greeting);
        lines.push("");
    }

    // -----------------------------------------
    // PROPOSAL TITLE
    // -----------------------------------------

    if (proposal.proposalTitle) {
        lines.push(
            `*${title(
                proposal.proposalTitle
            )}*`
        );

        lines.push("");
    }

    // -----------------------------------------
    // TRIP OVERVIEW
    // -----------------------------------------

    const overview =
        proposal.tripOverview || {};

    const overviewLines = [];

    if (overview.destination) {
        overviewLines.push(
            `${E.location} Destination: ${clean(
                overview.destination
            )}`
        );
    }

    if (overview.requestedTravelWindow) {
        overviewLines.push(
            `${E.calendar} Travel Window: ${clean(
                overview.requestedTravelWindow
            )}`
        );
    }

    if (
        overview.recommendedTravelWindow &&
        overview.recommendedTravelWindow !==
            overview.requestedTravelWindow
    ) {
        overviewLines.push(
            `${E.sparkle} Recommended Travel Window: ${clean(
                overview.recommendedTravelWindow
            )}`
        );
    }

    if (overview.requestedDuration) {
        overviewLines.push(
            `${E.stopwatch} Requested Duration: ${clean(
                overview.requestedDuration
            )}`
        );
    }

    if (
        overview.suggestedDuration &&
        overview.suggestedDuration !==
            overview.requestedDuration
    ) {
        overviewLines.push(
            `${E.sparkle} Suggested Duration: ${clean(
                overview.suggestedDuration
            )}`
        );
    }

    if (overview.travellers) {
        const adults =
            overview.travellers.adults ?? 0;

        const children =
            overview.travellers.children ?? 0;

        let travellerText =
            `${adults} Adult${
                adults === 1 ? "" : "s"
            }`;

        if (children) {
            travellerText +=
                `, ${children} Child${
                    children === 1
                        ? ""
                        : "ren"
                }`;
        }

        overviewLines.push(
            `${E.people} Travellers: ${travellerText}`
        );
    }

    if (overview.travelFrom) {
        overviewLines.push(
            `${E.airplaneUp} From: ${clean(
                overview.travelFrom
            )}`
        );
    }

    if (overview.travelTo) {
        overviewLines.push(
            `${E.airplaneDown} To: ${clean(
                overview.travelTo
            )}`
        );
    }

    if (overviewLines.length) {
        lines.push("*Trip Overview*");
        lines.push(...overviewLines);
        lines.push("");
    }

    // -----------------------------------------
    // ROUTE
    // -----------------------------------------

    const route =
        proposal.route || {};

    if (
        Array.isArray(
            route.recommendedRoute
        ) &&
        route.recommendedRoute.length
    ) {
        const routeText =
            route.recommendedRoute
                .map(item => clean(item))
                .filter(Boolean)
                .join(" → ");

        if (routeText) {
            lines.push(
                "*Recommended Route*"
            );

            lines.push(routeText);
            lines.push("");
        }
    }

    if (route.entryPoint) {
        lines.push(
            `${E.airplaneUp} *Entry:* ${clean(
                route.entryPoint
            )}`
        );
    }

    if (route.exitPoint) {
        lines.push(
            `${E.airplaneDown} *Exit:* ${clean(
                route.exitPoint
            )}`
        );
    }

    if (route.routeReason) {
        lines.push(
            `${E.compass} *Route Logic:* ${clean(
                route.routeReason
            )}`
        );
    }

    if (
        route.entryPoint ||
        route.exitPoint ||
        route.routeReason
    ) {
        lines.push("");
    }

    // -----------------------------------------
    // ITINERARY ANALYSIS
    // -----------------------------------------

    list(
        lines,
        "Why This Itinerary",
        proposal.whyThisItinerary
    );

    // -----------------------------------------
    // ADVISORIES
    // -----------------------------------------

    if (proposal.routeAdvisory) {
        section(
            lines,
            `${E.warning} Route Advisory`,
            proposal.routeAdvisory
        );
    }

    if (proposal.suggestedPace) {
        section(
            lines,
            `${E.walking} Suggested Pace`,
            proposal.suggestedPace
        );
    }

    // -----------------------------------------
    // DAY-WISE ITINERARY
    // -----------------------------------------

    if (
        Array.isArray(
            proposal.dayWiseItinerary
        ) &&
        proposal.dayWiseItinerary.length
    ) {
        lines.push(
            `*${E.date} Day-wise Itinerary*`
        );

        proposal.dayWiseItinerary.forEach(
            (day, index) => {
                if (!day) return;

                const dayNumber =
                    day.day ||
                    index + 1;


                    const overnightStayLocation = (() => {
    const stays = Array.isArray(
        proposal.overnightStayLocations
    )
        ? proposal.overnightStayLocations
        : [];

    let nightCounter = 0;

    for (const stay of stays) {
        const stayNights =
            Number(stay?.nights) || 0;

        if (
            Number(dayNumber) >= nightCounter + 1 &&
            Number(dayNumber) <=
                nightCounter + stayNights
        ) {
            return clean(
                stay?.location
            );
        }

        nightCounter += stayNights;
    }

    return "";
})();




                let dayLabel =
                    String(dayNumber);

                if (
                    !dayLabel
                        .toLowerCase()
                        .startsWith("day ")
                ) {
                    dayLabel =
                        `Day ${dayLabel}`;
                }

                let heading =
                    `*${title(dayLabel)}*`;

                if (day.title) {
                    heading +=
                        ` — ${clean(
                            day.title
                        )}`;
                }

                lines.push(heading);

                if (day.description) {
                    lines.push(
                        clean(
                            day.description
                        )
                    );
                }


                if (overnightStayLocation) {
    lines.push(
        `🌜 Night stay at ${overnightStayLocation}`
    );
}



                lines.push("");
            }
        );
    }

    // -----------------------------------------
    // DESTINATION HIGHLIGHTS
    // -----------------------------------------

    list(
        lines,
        `${E.star} Destination Highlights`,
        proposal.destinationHighlights
    );

    // -----------------------------------------
    // SEASONAL INFORMATION
    // -----------------------------------------

    const seasonal =
        proposal.seasonalInformation || {};

    const seasonalLines = [];

    if (seasonal.season) {
        seasonalLines.push(
            `${E.leaf} Season: ${clean(
                seasonal.season
            )}`
        );
    }

    if (seasonal.weather) {
        seasonalLines.push(
            `${E.thermometer} Weather: ${clean(
                seasonal.weather
            )}`
        );
    }

    if (seasonal.climateNote) {
        seasonalLines.push(
            `${E.cloud} Climate: ${clean(
                seasonal.climateNote
            )}`
        );
    }

    if (seasonalLines.length) {
        lines.push(
            `*${E.sun} Seasonal Information*`
        );

        lines.push(
            ...seasonalLines
        );

        lines.push("");
    }

    // -----------------------------------------
    // SEASONAL HIGHLIGHTS
    // -----------------------------------------

    list(
        lines,
        `${E.sparkle} Seasonal Highlights`,
        seasonal.seasonalHighlights
    );

    // -----------------------------------------
    // SEASONAL ADVISORY
    // -----------------------------------------

    if (
        seasonal.seasonalAdvisory
    ) {
        section(
            lines,
            `${E.warning} Seasonal Advisory`,
            seasonal.seasonalAdvisory
        );
    }

    // -----------------------------------------
    // TRAVEL TIPS
    // -----------------------------------------

    list(
        lines,
        `${E.idea} Travel Tips`,
        proposal.travelTips
    );

    // -----------------------------------------
    // PACKING
    // -----------------------------------------

    list(
        lines,
        `${E.bag} Packing Advice`,
        proposal.packingAdvice
    );

    // -----------------------------------------
    // OPTIONAL EXPERIENCES
    // -----------------------------------------

    list(
        lines,
        `${E.sparkle} Optional Experiences`,
        proposal.optionalExperiences
    );

    // -----------------------------------------
    // PACKAGE INCLUDES
    // -----------------------------------------

    list(
        lines,
        `${E.check} Package Includes`,
        proposal.packageIncludes
    );

    // -----------------------------------------
    // PACKAGE EXCLUDES
    // -----------------------------------------

    list(
        lines,
        `${E.cross} Package Excludes`,
        proposal.packageExcludes
    );

    // -----------------------------------------
    // BUDGET
    // -----------------------------------------

    if (proposal.budgetPlanningNote) {
        section(
            lines,
            `${E.money} Budget Planning`,
            proposal.budgetPlanningNote
        );
    }

    // -----------------------------------------
    // PRICING NOTE
    // -----------------------------------------

    if (proposal.finalPricingNote) {
        section(
            lines,
            `${E.message} Pricing Note`,
            proposal.finalPricingNote
        );
    }

    // -----------------------------------------
    // SIGN-OFF
    // -----------------------------------------

    lines.push(
        "Please let us know if you would like us to make any changes to the itinerary."
    );

    lines.push("");
    lines.push("Warm Regards,");
    lines.push("*Team Orbitz Holidays*");

    // Final sanitation:
    // remove every accidental backslash and
    // collapse excessive blank lines.
    return lines
        .join("\n")
        .replace(/\\/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}





function LeadEditForm({
    editingLead,
    setEditingLead,
    updatingLead,
    handleUpdateLead,
    linkedClient,
    onEditClient
}) {
    return (
       <div
    style={{
        display: "grid",
        gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
        columnGap: "12px",
        rowGap: "8px",
        alignItems: "start"
    }}
>

            <div>
    <div style={labelStyle}>
        Lead Title
    </div>

    <input
        value={
            editingLead.leadTitle || ""
        }
        onChange={(e) =>
            setEditingLead({
                ...editingLead,
                leadTitle:
                    e.target.value
            })
        }
        placeholder="e.g. Kerala Family Holiday"
        style={fieldStyle}
    />
</div>

            <div>
                <label style={labelStyle}>
    Name *
</label>

<input
    value={
        linkedClient?.clientName ||
        editingLead.name ||
        ""
    }
    onChange={e => {
        if (!linkedClient) {
            setEditingLead({
                ...editingLead,
                name: e.target.value
            });
        }
    }}
    readOnly={Boolean(linkedClient)}
    style={{
        ...fieldStyle,
        background: linkedClient
            ? "#f8fafc"
            : "#ffffff",
        color: "#334155",
        cursor: linkedClient
            ? "default"
            : "text"
    }}
/>
            </div>

            <div>
                <label style={labelStyle}>
    Mobile *
</label>

<input
    value={
        linkedClient?.mobile ||
        editingLead.mobile ||
        ""
    }
    onChange={e => {
        if (!linkedClient) {
            setEditingLead({
                ...editingLead,
                mobile: e.target.value
            });
        }
    }}
    readOnly={Boolean(linkedClient)}
    style={{
        ...fieldStyle,
        background: linkedClient
            ? "#f8fafc"
            : "#ffffff",
        color: "#334155",
        cursor: linkedClient
            ? "default"
            : "text"
    }}
/>
            </div>

            <div>
                <label style={labelStyle}>
    Email
</label>

<input
    type="email"
    value={
        linkedClient?.email ||
        editingLead.email ||
        ""
    }
    onChange={e => {
        if (!linkedClient) {
            setEditingLead({
                ...editingLead,
                email: e.target.value
            });
        }
    }}
    readOnly={Boolean(linkedClient)}
    style={{
        ...fieldStyle,
        background: linkedClient
            ? "#f8fafc"
            : "#ffffff",
        color: "#334155",
        cursor: linkedClient
            ? "default"
            : "text"
    }}
/>
            </div>



            {linkedClient && (
    <div
        style={{
            gridColumn: "1 / -1",
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "-4px"
        }}
    >
        <button
            type="button"
            onClick={() =>
    onEditClient(linkedClient.client)
}
            style={{
                border: "1px solid #dbe3ea",
                background: "#f8fafc",
                color: "#475569",
                borderRadius: "6px",
                padding: "6px 11px",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer"
            }}
        >
            Edit Client
        </button>
    </div>
)}




            <div>
                <label style={labelStyle}>
                    Source
                </label>
                <select
                    value={editingLead.source || "Website"}
                    onChange={e =>
                        setEditingLead({
                            ...editingLead,
                            source: e.target.value
                        })
                    }
                    style={fieldStyle}
                >
                    {LEAD_SOURCES.map(source => (
                        <option
                            key={source}
                            value={source}
                        >
                            {source}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label style={labelStyle}>
                    Source Detail
                </label>
                <input
                    value={editingLead.sourceDetail || ""}
                    onChange={e =>
                        setEditingLead({
                            ...editingLead,
                            sourceDetail: e.target.value
                        })
                    }
                    style={fieldStyle}
                />
            </div>

            <div>
                <label style={labelStyle}>
                    Destination
                </label>
                <input
                    value={editingLead.destination || ""}
                    onChange={e =>
                        setEditingLead({
                            ...editingLead,
                            destination: e.target.value
                        })
                    }
                    style={fieldStyle}
                />
            </div>


                        <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px"
                }}
            >
                <div>
                    <label style={labelStyle}>
                        Preferred Month
                    </label>
                    <input
                        type="text"
                        value={
                            editingLead.preferredMonth || ""
                        }
                        onChange={e =>
                            setEditingLead({
                                ...editingLead,
                                preferredMonth:
                                    e.target.value
                            })
                        }
                        placeholder="e.g. October 2026"
                        style={fieldStyle}
                    />
                </div>

                <div>
                    <label style={labelStyle}>
                        Travellers
                    </label>
                    <input
                        type="text"
                        value={
                            editingLead.travellers || ""
                        }
                        onChange={e =>
                            setEditingLead({
                                ...editingLead,
                                travellers:
                                    e.target.value
                            })
                        }
                        placeholder="e.g. 2 travellers"
                        style={fieldStyle}
                    />
                </div>
            </div>


            

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px"
                }}
            >
                <div>
                    <label style={labelStyle}>
                        Travel From
                    </label>
                    <input
                        type="date"
                        value={editingLead.travelFrom || ""}
                        onChange={e =>
                            setEditingLead({
                                ...editingLead,
                                travelFrom: e.target.value
                            })
                        }
                        style={fieldStyle}
                    />
                </div>

                <div>
                    <label style={labelStyle}>
                        Travel To
                    </label>
                    <input
                        type="date"
                        value={editingLead.travelTo || ""}
                        onChange={e =>
                            setEditingLead({
                                ...editingLead,
                                travelTo: e.target.value
                            })
                        }
                        style={fieldStyle}
                    />
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px"
                }}
            >
                <div>
                    <label style={labelStyle}>
                        Adults
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={editingLead.adults ?? 0}
                        onChange={e =>
                            setEditingLead({
                                ...editingLead,
                                adults: Number(e.target.value)
                            })
                        }
                        style={fieldStyle}
                    />
                </div>

                <div>
                    <label style={labelStyle}>
                        Children
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={editingLead.children ?? 0}
                        onChange={e =>
                            setEditingLead({
                                ...editingLead,
                                children: Number(e.target.value)
                            })
                        }
                        style={fieldStyle}
                    />
                </div>
            </div>

            <div>
                <label style={labelStyle}>
                    Status
                </label>
                <select
                    value={editingLead.status || "New"}
                    onChange={e =>
                        setEditingLead({
                            ...editingLead,
                            status: e.target.value
                        })
                    }
                    style={fieldStyle}
                >
                    {LEAD_STATUSES.map(status => (
                        <option
                            key={status}
                            value={status}
                        >
                            {status}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label style={labelStyle}>
                    Assigned To
                </label>
                <input
                    value={editingLead.assignedTo || ""}
                    onChange={e =>
                        setEditingLead({
                            ...editingLead,
                            assignedTo: e.target.value
                        })
                    }
                    style={fieldStyle}
                />
            </div>

            <div>
                <label style={labelStyle}>
                    Budget
                </label>
                <input
                    value={editingLead.budget || ""}
                    onChange={e =>
                        setEditingLead({
                            ...editingLead,
                            budget: e.target.value
                        })
                    }
                    style={fieldStyle}
                />
            </div>


            <div>
    <label style={labelStyle}>
        Campaign
    </label>
    <input
        value={editingLead.campaign || ""}
        onChange={e =>
            setEditingLead({
                ...editingLead,
                campaign: e.target.value
            })
        }
        style={fieldStyle}
    />
</div>

<div>
    <label style={labelStyle}>
        UTM Source
    </label>
    <input
        value={editingLead.utmSource || ""}
        onChange={e =>
            setEditingLead({
                ...editingLead,
                utmSource: e.target.value
            })
        }
        style={fieldStyle}
    />
</div>

<div>
    <label style={labelStyle}>
        UTM Medium
    </label>
    <input
        value={editingLead.utmMedium || ""}
        onChange={e =>
            setEditingLead({
                ...editingLead,
                utmMedium: e.target.value
            })
        }
        style={fieldStyle}
    />
</div>

<div>
    <label style={labelStyle}>
        UTM Campaign
    </label>
    <input
        value={editingLead.utmCampaign || ""}
        onChange={e =>
            setEditingLead({
                ...editingLead,
                utmCampaign: e.target.value
            })
        }
        style={fieldStyle}
    />
</div>


            <div>
                <label style={labelStyle}>
                    Next Follow-up
                </label>
                <input
                    type="date"
                    value={editingLead.nextFollowUp || ""}
                    onChange={e =>
                        setEditingLead({
                            ...editingLead,
                            nextFollowUp: e.target.value
                        })
                    }
                    style={fieldStyle}
                />
            </div>

            <div>
                <label style={labelStyle}>
                    Requirement
                </label>
                <textarea
                    value={editingLead.requirement || ""}
                    onChange={e =>
                        setEditingLead({
                            ...editingLead,
                            requirement: e.target.value
                        })
                    }
                    rows={4}
                    style={{
                        ...fieldStyle,
                        resize: "vertical"
                    }}
                />
            </div>

            <div>
                <label style={labelStyle}>
                    Notes
                </label>
                <textarea
                    value={editingLead.notes || ""}
                    onChange={e =>
                        setEditingLead({
                            ...editingLead,
                            notes: e.target.value
                        })
                    }
                    rows={4}
                    style={{
                        ...fieldStyle,
                        resize: "vertical"
                    }}
                />
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "8px",
                    paddingTop: "4px",
                    paddingBottom: "10px"
                }}
            >
                <button
                    type="button"
                    onClick={() =>
                        setEditingLead(null)
                    }
                    style={{
                        background: "#e2e8f0",
                        color: "#334155",
                        border: "none",
                        borderRadius: "7px",
                        padding: "9px 16px",
                        cursor: "pointer",
                        fontWeight: 700
                    }}
                >
                    Cancel
                </button>

                <button
    type="button"
    disabled={updatingLead}
    onClick={handleUpdateLead}
    style={{
        background: "#0f766e",
        color: "#fff",
        border: "none",
        borderRadius: "7px",
        padding: "9px 16px",
        cursor: updatingLead
            ? "default"
            : "pointer",
        fontWeight: 700,
        opacity: updatingLead ? 0.7 : 1
    }}
>
    {updatingLead
        ? "Saving..."
        : "Save Changes"}
</button>
            </div>
        </div>
    );
}



const MUST_VISIT_OPTIONS = {
    Japan: [
        "Tokyo",
        "Kyoto",
        "Mount Fuji",
        "Osaka",
        "Sakura / Hanami Experience",
        "Nara",
        "Hiroshima",
        "Hakone"
    ],

    Kerala: [
        "Kochi",
        "Munnar",
        "Thekkady",
        "Alleppey / Kumarakom",
        "Varkala",
        "Kovalam",
        "Wayanad"
    ],

    Kashmir: [
        "Srinagar",
        "Gulmarg",
        "Pahalgam",
        "Sonamarg",
        "Dal Lake / Shikara Ride",
        "Mughal Gardens"
    ],

    Meghalaya: [
        "Shillong",
        "Cherrapunji / Sohra",
        "Dawki",
        "Mawlynnong",
        "Nongriat / Double Decker Living Root Bridge",
        "Laitlum Canyon"
    ],

    Goa: [
        "North Goa Beaches",
        "South Goa Beaches",
        "Panaji",
        "Old Goa",
        "Fort Aguada",
        "Dudhsagar Falls"
    ],

    Andaman: [
        "Port Blair",
        "Havelock Island / Swaraj Dweep",
        "Neil Island / Shaheed Dweep",
        "Radhanagar Beach",
        "Cellular Jail",
        "Ross Island"
    ],

    Ladakh: [
        "Leh",
        "Nubra Valley",
        "Pangong Lake",
        "Sham Valley",
        "Khardung La",
        "Tso Moriri",
        "Magnetic Hill"
    ],

    Sikkim: [
        "Gangtok",
        "Tsomgo Lake",
        "Nathula Pass",
        "Pelling",
        "Lachung",
        "Yumthang Valley",
        "Ravangla"
    ],

    Rajasthan: [
        "Jaipur",
        "Udaipur",
        "Jodhpur",
        "Jaisalmer",
        "Pushkar",
        "Ranthambore",
        "Amber Fort"
    ],

    Singapore: [
        "Marina Bay",
        "Gardens by the Bay",
        "Sentosa Island",
        "Universal Studios Singapore",
        "Singapore Flyer",
        "Chinatown",
        "Little India"
    ],

    Malaysia: [
        "Kuala Lumpur",
        "Petronas Twin Towers",
        "Batu Caves",
        "Genting Highlands",
        "Langkawi",
        "Penang",
        "George Town"
    ],

    Thailand: [
        "Bangkok",
        "Pattaya",
        "Phuket",
        "Krabi",
        "Chiang Mai",
        "Phi Phi Islands",
        "Grand Palace"
    ],

    Dubai: [
        "Burj Khalifa",
        "Dubai Mall",
        "Palm Jumeirah",
        "Dubai Marina",
        "Desert Safari",
        "Dubai Frame",
        "Museum of the Future"
    ],

    Bali: [
        "Ubud",
        "Kuta",
        "Seminyak",
        "Nusa Dua",
        "Uluwatu",
        "Tanah Lot",
        "Nusa Penida"
    ],

    SriLanka: [
        "Colombo",
        "Kandy",
        "Nuwara Eliya",
        "Ella",
        "Bentota",
        "Galle",
        "Sigiriya"
    ],

    Maldives: [
        "Male",
        "Resort Island",
        "Snorkeling",
        "Scuba Diving",
        "Sunset Cruise",
        "Dolphin Cruise",
        "Water Sports"
    ],

    Vietnam: [
        "Hanoi",
        "Halong Bay",
        "Da Nang",
        "Hoi An",
        "Ho Chi Minh City",
        "Nha Trang",
        "Mekong Delta"
    ]
};





export default function LeadManagement({
    userProfile,
    onBackToWorkspace,
    onEditClient,
    onOpenQuotation,
    initialLead,
    resumeProposal,
    onBackToProposalLibrary
}) {

    const [leads, setLeads] = useState([]);

    const [showForm, setShowForm] =
        useState(false);

    const [formData, setFormData] =
        useState(emptyLead);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

        const [searchText, setSearchText] =
    useState("");

const [sourceFilter, setSourceFilter] =
    useState("All");

const [statusFilter, setStatusFilter] =
    useState("All");

    const [followUpFilter, setFollowUpFilter] =
    useState("All");

   const [selectedLead, setSelectedLead] =
    useState(null);


    const getAIProposalStorageKey = leadId =>
    leadId
        ? `orbitz_ai_proposal_draft_${leadId}`
        : null;




const [editingLead, setEditingLead] =
    useState(null);

const [updatingLead, setUpdatingLead] =
    useState(false);

const [linkedClient, setLinkedClient] =
    useState(null);


    const [quotations, setQuotations] =
    useState([]);


const [showClientLinker, setShowClientLinker] =
    useState(false);

    const [showAIProposal, setShowAIProposal] =
    useState(false);

    const [aiProposalInputs, setAIProposalInputs] = useState(null);

    const [aiProposalLeadId, setAIProposalLeadId] =
    useState(null);

    const [aiProposalResult, setAIProposalResult] =
    useState(null);

    const [isLibraryResume, setIsLibraryResume] =
    useState(false);




    const handleResumeLibraryProposal = (proposal) => {
    if (!proposal) {
        return;
    }

    setAIProposalResult(proposal);

    setAIProposalPreviewMode(false);
    setAIProposalEditing(false);
    setShowAIProposal(false);
    setShowAIWhatsAppEditor(true);
};




    const [hasSavedAIProposal, setHasSavedAIProposal] =
    useState(false);



    useEffect(() => {
    const leadId =
        aiProposalLeadId;

    const storageKey =
        getAIProposalStorageKey(
            leadId
        );

    if (
        !storageKey ||
        !aiProposalResult
    ) {
        return;
    }

    try {
        localStorage.setItem(
            storageKey,
            JSON.stringify(
                aiProposalResult
            )
        );
    } catch (error) {
        console.error(
            "Could not save AI proposal:",
            error
        );
    }
}, [
    aiProposalResult,
    aiProposalLeadId
]);


useEffect(() => {
    const leadId =
        selectedLead?.id;

    if (!leadId) {
        return;
    }

    const storageKey =
        getAIProposalStorageKey(
            leadId
        );

    if (!storageKey) {
        return;
    }

    try {
        const saved =
            localStorage.getItem(
                storageKey
            );

        if (saved) {
    setAIProposalResult(
        JSON.parse(saved)
    );

    setAIProposalLeadId(
        leadId
    );

    setHasSavedAIProposal(true);

} else {
    setAIProposalResult(null);
    setAIProposalLeadId(null);
    setHasSavedAIProposal(false);
}
    } catch (error) {
        console.error(
            "Could not restore AI proposal:",
            error
        );

        setAIProposalResult(null);
        setAIProposalLeadId(null);
        setHasSavedAIProposal(false);
    }
}, [
    selectedLead?.id
]);







const [aiProposalGenerating, setAIProposalGenerating] = useState(false);

const [aiProposalPreviewMode, setAIProposalPreviewMode] = useState(false);

const [aiProposalEditing, setAIProposalEditing] = useState(false);

const [showAIWhatsAppEditor, setShowAIWhatsAppEditor] = useState(false);


const [clientLinkLoading, setClientLinkLoading] =
    useState(false);

    const [clients, setClients] = useState([]);
    


    const clientMap = Object.fromEntries(
    clients
        .filter(client => client?.clientId)
        .map(client => [
            client.clientId,
            client
        ])
);




    const [editingClient, setEditingClient] =
    useState(null);

    const [viewedClient, setViewedClient] =
    useState(null);

    const [clientBeforeLead, setClientBeforeLead] =
    useState(null);




    useEffect(() => {
    let active = true;

    async function loadClients() {
        try {
            const savedClients =
                await getClients();

            if (active) {
                setClients(savedClients);
            }
        } catch (error) {
            console.error(
                "Failed to load clients:",
                error
            );
        }
    }

    loadClients();

    return () => {
        active = false;
    };
}, []);



useEffect(() => {
    let active = true;

    async function loadQuotations() {
        try {
            const savedQuotations =
                await getAllDraftsFromFirestore();

            if (active) {
                setQuotations(
                    savedQuotations || []
                );
            }
        } catch (error) {
            console.error(
                "Failed to load quotations:",
                error
            );
        }
    }

    loadQuotations();

    return () => {
        active = false;
    };
}, []);



useEffect(() => {
    if (!initialLead) {
        return;
    }

    setSelectedLead(initialLead);
}, [initialLead]);



useEffect(() => {
    if (!resumeProposal?.proposal) {
        return;
    }


    setIsLibraryResume(true);




    setAIProposalResult(
        resumeProposal.proposal
    );

    setAIProposalPreviewMode(false);
    setAIProposalEditing(false);
    setShowAIProposal(false);
    setShowAIWhatsAppEditor(true);
}, [resumeProposal]);





const getQuotationForLead = (lead) => {
    if (!lead || !Array.isArray(quotations)) {
        return null;
    }

    if (lead.id) {
        return (
            quotations.find(
                quotation =>
                    quotation.leadDocId === lead.id
            ) || null
        );
    }

    if (lead.leadId) {
        return (
            quotations.find(
                quotation =>
                    quotation.leadId === lead.leadId
            ) || null
        );
    }

    return null;
};




useEffect(() => {
    if (!selectedLead || clients.length === 0) {
        return;
    }

    if (
        !selectedLead.clientId &&
        !selectedLead.clientDocId
    ) {
        setLinkedClient(null);
        return;
    }

    const client = clients.find(item =>
        (
            selectedLead.clientDocId &&
            item.id === selectedLead.clientDocId
        ) ||
        (
            selectedLead.clientId &&
            item.clientId === selectedLead.clientId
        )
    );

    if (client) {
        setLinkedClient({
            client,
            possibleClients: [],
           relationshipType:
    selectedLead.clientRelationshipType ||
    "existing"
        });
    }
}, [selectedLead, clients]);





const findPossibleClients = (lead) => {
    if (!lead) {
        return [];
    }

    const normalizeName = value =>
        String(value || "")
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase();

    const normalizeEmail = value =>
        String(value || "")
            .trim()
            .toLowerCase();

    const normalizeMobile = value =>
        String(value || "")
            .replace(/\D/g, "");

    const leadName =
        normalizeName(lead.name);

    const leadEmail =
        normalizeEmail(lead.email);

    const leadMobile =
        normalizeMobile(lead.mobile);

    return clients
        .map(client => {
            const clientName =
                normalizeName(client.clientName);

            const clientContactPerson =
                normalizeName(client.contactPerson);

            const clientEmail =
                normalizeEmail(client.email);

            const clientMobile =
                normalizeMobile(client.mobile);

            const matchReasons = [];

            if (
                leadMobile &&
                clientMobile &&
                leadMobile === clientMobile
            ) {
                matchReasons.push(
                    "Mobile number matches"
                );
            }

            if (
                leadEmail &&
                clientEmail &&
                leadEmail === clientEmail
            ) {
                matchReasons.push(
                    "Email matches"
                );
            }

            if (
                leadName &&
                (
                    leadName === clientName ||
                    leadName === clientContactPerson
                )
            ) {
                matchReasons.push(
                    "Name matches"
                );
            }

            if (matchReasons.length === 0) {
                return null;
            }

            return {
                ...client,
                matchReasons
            };
        })
        .filter(Boolean);
};



const handleOpenClientLinker = () => {
    if (!selectedLead) {
        return;
    }

    const possibleClients =
        findPossibleClients(selectedLead);

    setLinkedClient({
        possibleClients
    });

    

    setShowClientLinker(true);
};





    const [leadQuotationMap, setLeadQuotationMap] =
    useState({});



    const findMatchingClient = (lead) => {
    if (!lead?.mobile) {
        return null;
    }

    const leadMobile =
        String(lead.mobile).replace(/\D/g, "");

    if (!leadMobile) {
        return null;
    }

    return (
        clients.find(client => {
            const clientMobile =
                String(client.mobile || "")
                    .replace(/\D/g, "");

            return (
                clientMobile &&
                clientMobile === leadMobile
            );
        }) || null
    );
};



    /*
    =====================================================
    LOAD LEADS
    =====================================================
    */

    const loadLeads = async () => {

        try {

            setLoading(true);
            setError("");

            const data =
                await getAllLeads();

            setLeads(data);

        } catch (err) {

            console.error(
                "Lead loading failed:",
                err
            );

            setError(
                "Unable to load leads."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadLeads();

    }, []);



    useEffect(() => {

    const loadLeadQuotationMap = async () => {

        try {

            const drafts =
                await getAllDraftsFromFirestore();

            if (!Array.isArray(drafts)) {

                setLeadQuotationMap({});
                return;

            }

            const map = {};

            drafts.forEach(draft => {

                if (
                    draft?.leadId &&
                    draft?.quotationNo
                ) {

                    map[draft.leadId] =
                        draft.quotationNo;

                }

            });

            setLeadQuotationMap(map);

        } catch (error) {

            console.error(
                "Failed to load Lead quotation links:",
                error
            );

            setLeadQuotationMap({});

        }

    };

    loadLeadQuotationMap();

}, []);




    /*
    =====================================================
    FORM HANDLERS
    =====================================================
    */

    const handleChange = (field, value) => {

        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

    };


    const resetForm = () => {

        setFormData({
            ...emptyLead,
            assignedTo:
                userProfile?.username ||
                userProfile?.displayName ||
                ""
        });

    };


    /*
    =====================================================
    CREATE LEAD
    =====================================================
    */

    const handleCreateLead = async () => {

        if (!formData.name.trim()) {

            setError(
                "Client name is required."
            );

            return;
        }

        if (!formData.mobile.trim()) {

            setError(
                "Mobile number is required."
            );

            return;
        }

        try {

            setSaving(true);
            setError("");

            await createLead({

    ...formData,

    createdBy:
        userProfile?.uid ||
        "",

    createdByName:
        userProfile?.username ||
        userProfile?.displayName ||
        userProfile?.email ||
        ""

});

            resetForm();

            setShowForm(false);

            await loadLeads();

        } catch (err) {

            console.error(
                "Lead creation failed:",
                err
            );

            setError(
                "Unable to save lead. Please try again."
            );

        } finally {

            setSaving(false);

        }
    };


    const handleUpdateLead = async () => {

    if (!editingLead) return;

    if (!editingLead.name?.trim()) {
        setError("Client name is required.");
        return;
    }

    if (!editingLead.mobile?.trim()) {
        setError("Mobile number is required.");
        return;
    }

    try {

        setUpdatingLead(true);
        setError("");

       

        // ------------------------------------------
        // 2. UPDATE LEAD
        //    Keep Lead-specific information here.
        //    Do NOT use Lead name/mobile/email
        //    as the authoritative Client identity.
        // ------------------------------------------

        const {
            id,
            createdAt,
            updatedAt,
            name,
            mobile,
            email,
            ...updates
        } = editingLead;

        await updateLead(id, {
            ...updates,
            adults:
                Number(editingLead.adults || 0),
            children:
                Number(editingLead.children || 0)
        });

        // ------------------------------------------
        // 3. REFRESH LEADS
        // ------------------------------------------

        await loadLeads();

        // ------------------------------------------
        // 4. REFRESH SELECTED LEAD
        // ------------------------------------------

        setSelectedLead({
            ...editingLead,
            adults:
                Number(editingLead.adults || 0),
            children:
                Number(editingLead.children || 0)
        });

        setEditingLead(null);

    } catch (err) {

        console.error(
            "Lead update failed:",
            err
        );

        setError(
            "Unable to update lead. Please try again."
        );

    } finally {

        setUpdatingLead(false);

    }
};


const handleDeleteLead = async (lead) => {

    if (!lead?.id) {
        return;
    }

    const leadLabel =
        [
            lead.leadId,
            lead.name
        ]
            .filter(Boolean)
            .join(" — ");

    try {

        setError("");

        // ------------------------------------------
        // FIND LINKED QUOTATION FIRST
        // ------------------------------------------

        const linkedDraft =
            await getDraftByLeadDocId(
                lead.id
            );

        // ------------------------------------------
        // CLEAR CONFIRMATION MESSAGE
        // ------------------------------------------

        const confirmationMessage =
            linkedDraft?.quotationNo
                ? (
                    `Delete Lead ${leadLabel || "this lead"}?\n\n` +
                    `This Lead has a linked quotation:\n` +
                    `${linkedDraft.quotationNo}\n\n` +
                    `The quotation will remain in Draft Library, but its Lead relationship will be removed.`
                )
                : (
                    `Delete Lead ${leadLabel || "this lead"}?\n\n` +
                    `This Lead has no linked quotation.\n\n` +
                    `Only the Lead will be deleted.`
                );

        const confirmed =
            window.confirm(
                confirmationMessage
            );

        if (!confirmed) {
            return;
        }

        // ------------------------------------------
        // UNLINK QUOTATION
        // ------------------------------------------

        if (linkedDraft?.quotationNo) {

            await unlinkDraftFromLead(
                linkedDraft.quotationNo
            );

        }

        // ------------------------------------------
        // DELETE LEAD
        // ------------------------------------------

        await deleteLead(
            lead.id
        );

        // ------------------------------------------
        // REFRESH LEAD LIST
        // ------------------------------------------

        await loadLeads();

        if (
            selectedLead?.id ===
            lead.id
        ) {
            setSelectedLead(null);
            setEditingLead(null);
        }

    } catch (error) {

        console.error(
            "Lead deletion failed:",
            error
        );

        setError(
            "Unable to delete Lead. Please try again."
        );

    }

};





const getFollowUpStatus = (dateValue) => {

    if (!dateValue) {
        return "none";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const followUpDate =
        new Date(dateValue + "T00:00:00");

    followUpDate.setHours(0, 0, 0, 0);

    if (followUpDate < today) {
        return "overdue";
    }

    if (
        followUpDate.getTime() ===
        today.getTime()
    ) {
        return "today";
    }

    return "upcoming";
};




    const filteredLeads = leads.filter(lead => {

    const search =
        searchText.trim().toLowerCase();

    const matchesSearch =
        !search ||
        [
            lead.name,
            lead.mobile,
            lead.email,
            lead.destination,
            lead.leadId
        ]
            .filter(Boolean)
            .some(value =>
                String(value)
                    .toLowerCase()
                    .includes(search)
            );

    const matchesSource =
        sourceFilter === "All" ||
        lead.source === sourceFilter;

    const matchesStatus =
        statusFilter === "All" ||
        lead.status === statusFilter;

    const followUpStatus =
        getFollowUpStatus(
            lead.nextFollowUp
        );

    const matchesFollowUp =
        followUpFilter === "All" ||
        (followUpFilter === "Today" &&
            followUpStatus === "today") ||
        (followUpFilter === "Overdue" &&
            followUpStatus === "overdue") ||
        (followUpFilter === "Upcoming" &&
            followUpStatus === "upcoming") ||
        (followUpFilter === "No Follow-up" &&
            followUpStatus === "none");

    return (
        matchesSearch &&
        matchesSource &&
        matchesStatus &&
        matchesFollowUp
    );
});

    /*
    =====================================================
    STYLES
    =====================================================
    */

   


    const cardStyle = {
        background: "#fff",
        border: "1px solid #dbe3ea",
        borderRadius: "10px",
        boxSizing: "border-box"
    };


    return (
        <div
            style={{
                minHeight: "calc(100vh - 58px)",
                background: "#f5f7fa",
                padding: "24px 32px 40px",
                boxSizing: "border-box"
            }}
        >

            {/* PAGE HEADER */}

           <div
    style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        marginBottom: "20px",
        flexWrap: "wrap"
    }}
>
    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
        }}
    >

        <button
            type="button"
            onClick={onBackToWorkspace}
            style={{
                background: "#334155",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                padding: "9px 14px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "12px",
                whiteSpace: "nowrap"
            }}
        >
            ← Back
        </button>

        <div>

            <h1
                style={{
                    margin: 0,
                    fontSize: "23px",
                    fontWeight: 700,
                    color: "#172033"
                }}
            >
                Lead Management
            </h1>

            <p
                style={{
                    margin: "5px 0 0",
                    fontSize: "13px",
                    color: "#64748b"
                }}
            >
                Central record of Orbitz business enquiries.
            </p>

        </div>

    </div>


    <button
        type="button"
        onClick={() => {

            setError("");

            resetForm();

            setShowForm(true);

        }}
        style={{
            background: "#0f766e",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            padding: "10px 18px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "13px"
        }}
    >
        + New Lead
    </button>

</div>


            {/* ERROR */}

            {error && (
                <div
                    style={{
                        marginBottom: "14px",
                        padding:
                            "10px 12px",
                        background:
                            "#fef2f2",
                        border:
                            "1px solid #fecaca",
                        color:
                            "#b91c1c",
                        borderRadius: "8px",
                        fontSize: "12px",
                        fontWeight: 600
                    }}
                >
                    {error}
                </div>
            )}


           {/* NEW LEAD FORM */}

{showForm && (
    <LeadForm
        formData={formData}
        setFormData={setFormData}
        handleChange={handleChange}
        handleCreateLead={handleCreateLead}
        saving={saving}
        onClose={() => {
            setShowForm(false);
            setError("");
        }}
        cardStyle={cardStyle}
    />
)}


            {/* LEAD LIST */}

            <div
                style={{
                    ...cardStyle,
                    overflow: "hidden"
                }}
            >

<div
    style={{
        padding: "12px 14px",
        borderBottom: "1px solid #e2e8f0",
        display: "grid",
        gridTemplateColumns:
    "minmax(260px, 1fr) 180px 180px 180px",
        gap: "10px",
        background: "#fbfdff",
        boxSizing: "border-box"
    }}
>

    <input
        type="text"
        value={searchText}
        onChange={e =>
            setSearchText(e.target.value)
        }
        placeholder="Search name, mobile, email, destination or Lead ID..."
        style={fieldStyle}
    />

    <select
        value={sourceFilter}
        onChange={e =>
            setSourceFilter(e.target.value)
        }
        style={fieldStyle}
    >
        <option value="All">
            All Sources
        </option>

        {LEAD_SOURCES.map(source => (
            <option
                key={source}
                value={source}
            >
                {source}
            </option>
        ))}
    </select>

    <select
        value={statusFilter}
        onChange={e =>
            setStatusFilter(e.target.value)
        }
        style={fieldStyle}
    >
        <option value="All">
            All Statuses
        </option>

        {LEAD_STATUSES.map(status => (
            <option
                key={status}
                value={status}
            >
                {status}
            </option>
        ))}
    </select>

        <select
        value={followUpFilter}
        onChange={e =>
            setFollowUpFilter(e.target.value)
        }
        style={fieldStyle}
    >
        <option value="All">
            All Follow-ups
        </option>

        <option value="Today">
            Today
        </option>

        <option value="Overdue">
            Overdue
        </option>

        <option value="Upcoming">
            Upcoming
        </option>

        <option value="No Follow-up">
            No Follow-up
        </option>
    </select>

</div>

                <div
                    style={{
                        padding:
                            "14px 16px",
                        borderBottom:
                            "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems:
                            "center"
                    }}
                >

                    <div
                        style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#334155"
                        }}
                    >
                        Leads
                    </div>

                    <div
                        style={{
                            fontSize: "12px",
                            color: "#64748b"
                        }}
                    >
                       {filteredLeads.length} of {leads.length} lead
{leads.length === 1
    ? ""
    : "s"}
                    </div>

                </div>


                {loading ? (

                    <div
                        style={{
                            padding: "30px",
                            textAlign: "center",
                            color: "#64748b",
                            fontSize: "13px"
                        }}
                    >
                        Loading leads...
                    </div>

                ) : leads.length === 0 ? (

                    <div
                        style={{
                            padding: "40px",
                            textAlign: "center",
                            color: "#94a3b8",
                            fontSize: "13px"
                        }}
                    >
                        No leads yet.
                        <br />
                        Create the first lead using
                        <strong>
                            {" + New Lead"}
                        </strong>.
                    </div>

                ) : (

                    <div
                        style={{
                            overflowX: "auto"
                        }}
                    >

                        <div
                            style={{
                                minWidth:
                                    "900px"
                            }}
                        >

                            {/* TABLE HEADER */}

                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
    "130px 1.4fr 120px 140px 150px 130px 130px 110px 70px",
                                    gap: "10px",
                                    padding:
                                        "10px 14px",
                                    background:
                                        "#f8fafc",
                                    borderBottom:
                                        "1px solid #e2e8f0",
                                    fontSize: "10px",
                                    fontWeight: 800,
                                    color: "#64748b",
                                    textTransform:
                                        "uppercase"
                                }}
                            >

                                <div>Source</div>
                               <div
                                style={{
                                    paddingLeft: "0px",
                                    transform: "translateX(-35px)"
                                        }}
                                        >
                                            Client
                                                </div>
                                <div>Mobile</div>
                                <div>Destination</div>
                                <div>Travel</div>
                                <div>Status</div>
                                <div>Follow-up</div>
                                <div>ASSIGNED</div>

<div
    style={{
        textAlign: "center",
        fontSize: "10px",
        fontWeight: 800,
        color: "#64748b",
        textTransform: "uppercase"
    }}
>
    ACTION
</div>

                            </div>


                          {filteredLeads.map(lead => (

    <div
        key={lead.id}
        onClick={() => setSelectedLead(lead)}
        style={{
            display: "grid",
            cursor: "pointer",
                                        gridTemplateColumns:
    "130px 1.4fr 120px 140px 150px 130px 130px 110px 70px",
                                        gap: "10px",
                                        padding:
                                            "11px 14px",
                                        borderBottom:
                                            "1px solid #eef2f7",
                                        alignItems:
                                            "center",
                                        fontSize:
                                            "12px",
                                        color:
                                            "#334155"
                                    }}
                                >

                                   <div
    style={{
        minWidth: 0
    }}
>
    <div>
        {lead.source || "—"}
    </div>

    {lead.sourceDetail && (
        <div
            style={{
                marginTop: "2px",
                fontSize: "10px",
                fontWeight: 600,
                color: "#64748b",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
            }}
            title={lead.sourceDetail}
        >
            {lead.sourceDetail}
        </div>
    )}
</div>

                                   <div
    style={{
        minWidth: 0
    }}
>
    <div
    style={{
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        fontWeight: 700
    }}
    title={
        clientMap?.[lead.clientId]?.clientName ||
        lead.name ||
        ""
    }
>
    {clientMap?.[lead.clientId]?.clientName ||
        lead.name ||
        "—"}
</div>

    {lead.leadId && (
        <div
            style={{
                marginTop: "2px",
                fontSize: "10px",
                fontWeight: 500,
                color: "#64748b",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
            }}
            title={[
                lead.leadId,
                leadQuotationMap[lead.leadId]
            ]
                .filter(Boolean)
                .join(" · ")}
        >
            {lead.leadId}

            {leadQuotationMap[lead.leadId] && (
    <>
        {" · "}
        {"ORB-" +
            leadQuotationMap[lead.leadId]
                .slice(-6)}
    </>
)}
        </div>
    )}
</div>
                                    <div>
                                        {lead.mobile ||
                                            "—"}
                                    </div>

                                    <div>
                                        {lead.destination ||
                                            "—"}
                                    </div>

                                    <div>
                                        {lead.travelFrom ||
                                            lead.travelTo
                                            ? `${lead.travelFrom || "—"} → ${lead.travelTo || "—"}`
                                            : "—"}
                                    </div>

                                    <div>
                                        <span
                                            style={{
                                                display:
                                                    "inline-block",
                                                padding:
                                                    "4px 7px",
                                                borderRadius:
                                                    "999px",
                                                background:
                                                    "#ecfdf5",
                                                color:
                                                    "#047857",
                                                fontSize:
                                                    "10px",
                                                fontWeight:
                                                    700
                                            }}
                                        >
                                            {lead.status ||
                                                "New"}
                                        </span>
                                    </div>

                                  <div
    onClick={(e) => {
        e.stopPropagation();
    }}
    style={{
        fontWeight:
            getFollowUpStatus(
                lead.nextFollowUp
            ) === "overdue" ||
            getFollowUpStatus(
                lead.nextFollowUp
            ) === "today"
                ? 700
                : 400,

        color:
            getFollowUpStatus(
                lead.nextFollowUp
            ) === "overdue"
                ? "#dc2626"
                : getFollowUpStatus(
                      lead.nextFollowUp
                  ) === "today"
                    ? "#d97706"
                    : "#334155",

        cursor: "pointer"
    }}
>
    {lead.nextFollowUp ? (
        <span
            onClick={(e) => {
                e.stopPropagation();

                const input =
                    e.currentTarget
                        .nextElementSibling;

                if (input) {
                    if (input.showPicker) {
                        input.showPicker();
                    } else {
                        input.click();
                    }
                }
            }}
            style={{
                cursor: "pointer"
            }}
        >
            {(() => {
                const [year, month, day] =
                    lead.nextFollowUp.split("-");

                return `${day}/${month}/${year}`;
            })()}
        </span>
    ) : (
        <span
            onClick={(e) => {
                e.stopPropagation();

                const input =
                    e.currentTarget
                        .nextElementSibling;

                if (input) {
                    if (input.showPicker) {
                        input.showPicker();
                    } else {
                        input.click();
                    }
                }
            }}
            style={{
                cursor: "pointer",
                color: "#94a3b8"
            }}
        >
            Set date
        </span>
    )}

    <input
        type="date"
        value={lead.nextFollowUp || ""}
        onChange={async (e) => {

            const newDate =
                e.target.value;

            if (!newDate) return;

            if (
                newDate ===
                lead.nextFollowUp
            ) {
                return;
            }

            try {

                await updateLead(
                    lead.id,
                    {
                        nextFollowUp:
                            newDate
                    }
                );

                setLeads(prev =>
                    prev.map(item =>
                        item.id === lead.id
                            ? {
                                ...item,
                                nextFollowUp:
                                    newDate
                            }
                            : item
                    )
                );

            } catch (error) {

                console.error(
                    "Follow-up update failed:",
                    error
                );

                alert(
                    "Unable to update follow-up date."
                );
            }
        }}
        onClick={(e) =>
            e.stopPropagation()
        }
        style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            opacity: 0,
            pointerEvents: "none"
        }}
    />
</div>

                                    <div>
                                        {lead.assignedTo ||
                                            "—"}
                                    </div>

                                    <div
    style={{
        display: "flex",
        justifyContent: "center"
    }}
>
    <button
        type="button"
        onClick={(e) => {

            e.stopPropagation();

            handleDeleteLead(lead);

        }}
        style={{
            border: "1px solid #fecaca",
            background: "#fff",
            color: "#dc2626",
            borderRadius: "6px",
            padding: "4px 7px",
            fontSize: "11px",
            fontWeight: 700,
            cursor: "pointer"
        }}
        title="Delete Lead"
    >
        Delete
    </button>
</div>

                                </div>

                            ))}

                        </div>

                    </div>

                )}
            </div>

            {/* =====================================================
                LEAD DETAIL DRAWER
            ===================================================== */}

            {selectedLead && (
                <div
                    style={{
    position: "fixed",
    top: "2vh",
    left: "50%",
    transform: "translateX(-50%)",
   width: "96vw",
    maxWidth: "1500px",
    height: "96vh",
    maxHeight: "96vh",
    background: "#fff",
    boxShadow:
        "0 20px 60px rgba(15, 23, 42, 0.22)",
    border:
        "1px solid #dbe3ea",
    borderRadius: "18px",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
}}
                >

                    {/* DRAWER HEADER */}

                    <div
                        style={{
                            minHeight: "58px",
                            padding: "10px 16px",
                            boxSizing: "border-box",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderBottom:
                                "1px solid #e2e8f0",
                            background: "#f8fafc"
                        }}
                    >

                        

                        <div>

                            <div
                                style={{
                                    fontSize: "15px",
                                    fontWeight: 800,
                                    color: "#172033"
                                }}
                            >
                               {editingLead ? "Edit Lead" : "Lead Details"}
                            </div>

                           {!editingLead && (
    <div
        style={{
            marginTop: "3px",
            fontSize: "10px",
            color: "#64748b"
        }}
    >
        {selectedLead.leadId || "Lead"}
    </div>
)}

                        </div>


                        <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "7px"
    }}
>

    {!editingLead && (
    <button
        type="button"
       onClick={() =>
    setEditingLead({
        ...selectedLead,
        name:
            clientMap?.[selectedLead.clientId]?.clientName ||
            selectedLead.name ||
            ""
    })
}
        style={{
            background: "#0f766e",
            color: "#fff",
            border: "none",
            borderRadius: "7px",
            padding: "7px 11px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: "11px"
        }}
    >
        ✎ Edit
    </button>
    )}

    <button
        type="button"
       onClick={() => {
    setEditingLead(null);
    setSelectedLead(null);

    if (clientBeforeLead) {
        setViewedClient(clientBeforeLead);
        setClientBeforeLead(null);
    }
}}
        style={{
            width: "30px",
            height: "30px",
            border: "none",
            borderRadius: "7px",
            background: "#e2e8f0",
            color: "#334155",
            cursor: "pointer",
            fontSize: "18px",
            lineHeight: 1
        }}
    >
        ×
    </button>
</div>

                    </div>


                    {/* DRAWER CONTENT */}

                    <div
                        style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "18px",
                            boxSizing: "border-box"
                        }}
                    >
{editingLead ? (
   <LeadEditForm
    editingLead={editingLead}
    setEditingLead={setEditingLead}
    updatingLead={updatingLead}
    handleUpdateLead={handleUpdateLead}
    linkedClient={linkedClient}
   onEditClient={client => {
    if (typeof onEditClient === "function") {
        onEditClient(client);
    }
}}
/>
) : (
  <>
                      {/* LEAD CONTACT */}

<div
    style={{
        marginBottom: "14px",
        padding: "12px 14px",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        gap: "14px"
    }}
>
    {/* AVATAR */}

    <div
        style={{
            width: "42px",
            height: "42px",
            flexShrink: 0,
            borderRadius: "50%",
            background: "#eff6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "21px"
        }}
    >
        👤
    </div>

    {/* NAME / TITLE */}

    <div
    style={{
        minWidth: 0,
        width: "260px",
        textAlign: "left"
    }}
>
        <div
            style={{
                fontSize: "16px",
                fontWeight: 800,
                color: "#172033",
                lineHeight: 1.2
            }}
        >
           {linkedClient?.client?.clientName ||
    selectedLead.name ||
    "—"}
        </div>

        <div
            style={{
                marginTop: "3px",
                fontSize: "11px",
                color: "#64748b",
                fontWeight: 600
            }}
        >
            {selectedLead.leadTitle ||
                "Travel Enquiry"}
        </div>
    </div>

    {/* MOBILE */}

    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            paddingLeft: "18px",
borderLeft: "1px solid #e2e8f0",
marginLeft: "10px",
            fontSize: "12px",
            color: "#475569",
            whiteSpace: "nowrap"
        }}
    >
        <span style={{ fontSize: "16px" }}>
            📞
        </span>

        <span>
            {selectedLead.mobile || "—"}
        </span>
    </div>

    {/* EMAIL */}

    {selectedLead.email && (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                paddingLeft: "14px",
                borderLeft: "1px solid #e2e8f0",
                fontSize: "12px",
                color: "#475569",
                whiteSpace: "nowrap"
            }}
        >
            <span style={{ fontSize: "15px" }}>
                ✉️
            </span>

            <span>
                {selectedLead.email}
            </span>
        </div>
    )}
</div>




<div
    style={{
        display: "grid",
        gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
        gap: "12px",
        marginBottom: "12px"
    }}
>



                       {/* CLIENT RELATIONSHIP */}

<div
    style={{
        marginBottom: "0",
        padding: "11px 14px",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        background: "#f8fafc"
    }}
>
    <div
        style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px"
        }}
    >
        {/* RELATIONSHIP INFO */}

        <div
            style={{
                minWidth: 0,
                flex: 1
            }}
        >
            <div
                style={{
                    fontSize: "10px",
                    fontWeight: 800,
                    color: "#64748b",
                    textTransform: "uppercase",
                    marginBottom: "6px"
                }}
            >
                Client Relationship
            </div>

            {linkedClient?.client ? (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        flexWrap: "wrap"
                    }}
                >
                    <div
                        style={{
                            fontSize: "12px",
                            fontWeight: 800,
                            color: "#166534"
                        }}
                    >
                        {linkedClient.relationshipType ===
                        "existing"
                            ? "🔗 Existing Client Linked"
                            : "✅ Client Created & Linked"}
                    </div>

                    <div
                        style={{
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#172033"
                        }}
                    >
                        {linkedClient.client.clientName}
                    </div>

                    <div
                        style={{
                            fontSize: "10px",
                            color: "#64748b"
                        }}
                    >
                        {linkedClient.client.clientId}
                    </div>

                    {linkedClient.client.mobile && (
                        <div
                            style={{
                                fontSize: "11px",
                                color: "#475569"
                            }}
                        >
                            📞 {linkedClient.client.mobile}
                        </div>
                    )}
                </div>
            ) : (
                <div
                    style={{
                        fontSize: "11px",
                        color: "#64748b"
                    }}
                >
                    No Client linked to this Lead yet.
                </div>
            )}
        </div>

        {/* ACTION */}

        {linkedClient?.client ? (
            <button
                type="button"
                onClick={e => {
    e.stopPropagation();

    setViewedClient(
        linkedClient.client
    );
}}
                style={{
                    flexShrink: 0,
                    padding: "6px 10px",
                    border: "1px solid #0f766e",
                    borderRadius: "6px",
                    background: "#fff",
                    color: "#0f766e",
                    fontSize: "10px",
                    fontWeight: 800,
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                }}
            >
                View Client
            </button>
        ) : (
            <button
                type="button"
                onClick={handleOpenClientLinker}
                style={{
                    flexShrink: 0,
                    background: "#0f766e",
                    color: "#fff",
                    border: "none",
                    borderRadius: "7px",
                    padding: "7px 11px",
                    fontSize: "10px",
                    fontWeight: 800,
                    cursor: "pointer",
                    whiteSpace: "nowrap"
                }}
            >
                ＋ Create / Link Client
            </button>
        )}
    </div>
</div>



{/* QUOTATION */}

{(() => {
    const leadQuotation =
        getQuotationForLead(selectedLead);

    return (
        <div
            style={{
                marginBottom: "0",
                padding: "11px 14px",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                background: "#f8fafc"
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "14px"
                }}
            >
                <div
                    style={{
                        minWidth: 0,
                        flex: 1
                    }}
                >
                    <div
                        style={{
                            fontSize: "10px",
                            fontWeight: 800,
                            color: "#64748b",
                            textTransform: "uppercase",
                            marginBottom: "6px"
                        }}
                    >
                        Quotation
                    </div>

                    {leadQuotation ? (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "14px",
                                flexWrap: "wrap"
                            }}
                        >
                            <div
                                style={{
                                    fontSize: "12px",
                                    fontWeight: 800,
                                    color: "#172033"
                                }}
                            >
                                📄{" "}
                                {leadQuotation.displayQuotationNo ||
                                    leadQuotation.quotationNo ||
                                    "Quotation"}
                            </div>

                            <div
                                style={{
                                    fontSize: "10px",
                                    color: "#64748b",
                                    fontWeight: 700
                                }}
                            >
                                Revision{" "}
                                {leadQuotation.revisionNo || 1}
                            </div>

                            <div
                                style={{
                                    fontSize: "10px",
                                    color: "#047857",
                                    fontWeight: 800
                                }}
                            >
                                {leadQuotation.status ||
                                    "Draft"}
                            </div>
                        </div>
                    ) : (
                        <div
                            style={{
                                fontSize: "11px",
                                color: "#64748b"
                            }}
                        >
                            No quotation created for this Lead yet.
                        </div>
                    )}
                </div>

                <button
                    type="button"
                  onClick={() => {
    if (onOpenQuotation) {
       onOpenQuotation(
    selectedLead,
    leadQuotation
        ? "view"
        : "create",
    leadQuotation || null
);
    }
}}
                    style={{
                        flexShrink: 0,
                        padding: "7px 11px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "7px",
                        background: "#ffffff",
                        color: "#334155",
                        fontSize: "11px",
                        fontWeight: 800,
                        cursor: "pointer"
                    }}
                >
                    {leadQuotation
                        ? "View Quotation"
                        : "Create Quotation"}
                </button>
            </div>
        </div>
    );
})()}

</div>





    {/* STATUS */}

                        <div
                            style={{
    display: "grid",
    gridTemplateColumns: "180px 180px",
    columnGap: "60px",
    rowGap: "12px"
}}
                        >

                            <div>

                                <div
                                    style={labelStyle}
                                >
                                    🗃️ Source
                                </div>

                                <div
                                    style={{
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        color: "#334155"
                                    }}
                                >
                                    {selectedLead.source ||
                                        "—"}
                                </div>

                            </div>


                            <div>

                                <div
                                    style={labelStyle}
                                >
                                   🏷️ Status
                                </div>

                                <div
                                    style={{
                                        fontSize: "12px",
                                        fontWeight: 700,
                                        color: "#047857"
                                    }}
                                >
                                    {selectedLead.status ||
                                        "New"}
                                </div>

                            </div>

                        </div>


                        {/* TRAVEL */}

                        <div
                            style={{
                                borderTop:
                                    "1px solid #e2e8f0",
                                paddingTop: "12px",
                                marginBottom: "12px"
                            }}
                        >

                            <div
                                style={{
                                    fontSize: "10px",
                                    fontWeight: 800,
                                    color: "#64748b",
                                    textTransform:
                                        "uppercase",
                                    marginBottom: "10px"
                                }}
                            >
                                Travel Requirement
                            </div>

                            <div
                                style={{
    display: "grid",
   gridTemplateColumns:
    "repeat(6, minmax(0, 1fr))",
    columnGap: "22px",
    rowGap: "12px"
}}
                            >

                                <div>

                                    <div
                                        style={labelStyle}
                                    >
                                        📍 Destination
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "13px",
                                            fontWeight: 700,
                                            color: "#334155"
                                        }}
                                    >
                                        {selectedLead.destination ||
                                            "—"}
                                    </div>

                                </div>


                               <div>

    <div
        style={labelStyle}
    >
        📅 Preferred Month
    </div>

    <div
        style={{
            fontSize: "13px",
            color: "#334155"
        }}
    >
        {selectedLead.preferredMonth ||
            "—"}
    </div>

</div>


<div>

    <div
        style={labelStyle}
    >
        👥 Travellers
    </div>

    <div
        style={{
            fontSize: "13px",
            color: "#334155"
        }}
    >
        {selectedLead.travellers ||
            "—"}
    </div>

</div>


<div>

    <div
        style={labelStyle}
    >
       🧑‍🤝‍🧑 Pax
    </div>

    <div
        style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "#334155"
        }}
    >
        {selectedLead.adults ||
            0}{" "}
        Adult
        {Number(
            selectedLead.adults ||
                0
        ) === 1
            ? ""
            : "s"}
        {" + "}
        {selectedLead.children ||
            0}{" "}
        Child
        {Number(
            selectedLead.children ||
                0
        ) === 1
            ? ""
            : "ren"}
    </div>

</div>


                                <div>

                                    <div
                                        style={labelStyle}
                                    >
                                        🛫 Travel From
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "13px",
                                            color: "#334155"
                                        }}
                                    >
                                        {selectedLead.travelFrom ||
                                            "—"}
                                    </div>

                                </div>


                                <div>

                                    <div
                                        style={labelStyle}
                                    >
                                       🛬 Travel To
                                    </div>

                                    <div
                                        style={{
                                            fontSize: "13px",
                                            color: "#334155"
                                        }}
                                    >
                                        {selectedLead.travelTo ||
                                            "—"}
                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* REQUIREMENT */}

                        <div
                            style={{
                                borderTop:
                                    "1px solid #e2e8f0",
                                paddingTop: "12px",
                                marginBottom: "12px"
                            }}
                        >

                            <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        marginBottom: "7px",
        fontSize: "11px",
        fontWeight: 800,
        color: "#475569",
        textTransform: "uppercase"
    }}
>
    <span
        style={{
            fontSize: "15px",
            lineHeight: 1
        }}
    >
        📝
    </span>
    Requirement
</div>

                           <div
    style={{
        padding: "9px 11px",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        background: "#f8fafc",
        fontSize: "12px",
        lineHeight: 1.5,
        color: "#334155",
        textAlign: "left"
    }}
>
    {selectedLead.requirement ||
        "No requirement entered."}
</div>

                        </div>


                        {/* OTHER INFORMATION */}

                        <div
                           style={{
    borderTop: "1px solid #e2e8f0",
    paddingTop: "12px",
    marginBottom: "12px"
}}
                        >

                            <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        fontSize: "10px",
        fontWeight: 800,
        color: "#64748b",
        textTransform: "uppercase",
        marginBottom: "8px"
    }}
>
    <span
        style={{
            fontSize: "15px",
            lineHeight: 1
        }}
    >
        📋
    </span>

    Lead Information
</div>


                           <div
    style={{
        display: "grid",
        gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
        columnGap: "20px",
        alignItems: "center"
    }}
>

                              <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        minWidth: 0,
        whiteSpace: "nowrap"
    }}
>
    <div
        style={{
            fontSize: "10px",
            fontWeight: 800,
            color: "#64748b"
        }}
    >
        Assigned To:
    </div>

    <div
        style={{
            fontSize: "11px",
            color: "#334155",
            fontWeight: 600
        }}
    >
        {selectedLead.assignedTo || "—"}
    </div>
</div>

<div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        minWidth: 0,
        whiteSpace: "nowrap"
    }}
>
    <div
        style={{
            fontSize: "10px",
            fontWeight: 800,
            color: "#64748b"
        }}
    >
        Budget:
    </div>

    <div
        style={{
            fontSize: "11px",
            color: "#334155",
            fontWeight: 600
        }}
    >
        {selectedLead.budget || "—"}
    </div>
</div>




                               <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        minWidth: 0,
        whiteSpace: "nowrap"
    }}
>
    <div
        style={{
            fontSize: "10px",
            fontWeight: 800,
            color: "#64748b"
        }}
    >
        Follow-up:
    </div>

    <div
        style={{
            fontSize: "11px",
            color: "#334155",
            fontWeight: 600
        }}
    >
        {selectedLead.nextFollowUp
    ? String(selectedLead.nextFollowUp)
        .split("-")
        .reverse()
        .join("-")
    : "—"}
    </div>
</div>


                                <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        minWidth: 0,
        whiteSpace: "nowrap"
    }}
>
    <div
        style={{
            fontSize: "10px",
            fontWeight: 800,
            color: "#64748b"
        }}
    >
        Source Detail:
    </div>

    <div
        style={{
            fontSize: "11px",
            color: "#334155",
            fontWeight: 600
        }}
    >
        {selectedLead.sourceDetail || "—"}
    </div>
</div>
                            </div>

                        </div>


                        {/* MARKETING ATTRIBUTION */}

<div
    style={{
    borderTop: "1px solid #e2e8f0",
    paddingTop: "12px",
    marginTop: "12px",
    marginBottom: "12px"
}}
>

   <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        fontSize: "10px",
        fontWeight: 800,
        color: "#64748b",
        textTransform: "uppercase",
        marginBottom: "8px"
    }}
>
    <span
        style={{
            fontSize: "15px",
            lineHeight: 1
        }}
    >
        📣
    </span>

    Marketing Attribution
</div>

    <div
        style={{
            display: "grid",
            gridTemplateColumns:
    "repeat(4, minmax(0, 1fr))",
columnGap: "20px",
alignItems: "center"
        }}
    >

        <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        minWidth: 0,
        whiteSpace: "nowrap"
    }}
>
    <div
        style={{
            fontSize: "10px",
            fontWeight: 800,
            color: "#64748b"
        }}
    >
        Campaign:
    </div>

    <div
        style={{
            fontSize: "11px",
            color: "#334155",
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis"
        }}
    >
        {selectedLead.campaign || "—"}
    </div>
</div>

       

<div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        minWidth: 0,
        whiteSpace: "nowrap"
    }}
>
    <div
        style={{
            fontSize: "10px",
            fontWeight: 800,
            color: "#64748b"
        }}
    >
        UTM Source: 
    </div>

    <div
        style={{
            fontSize: "11px",
            color: "#334155",
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis"
        }}
    >
       {selectedLead.utmSource || "—"}
    </div>
</div>

        

<div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        minWidth: 0,
        whiteSpace: "nowrap"
    }}
>
    <div
        style={{
            fontSize: "10px",
            fontWeight: 800,
            color: "#64748b"
        }}
    >
        UTM Medium: 
    </div>

    <div
        style={{
            fontSize: "11px",
            color: "#334155",
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis"
        }}
    >
       {selectedLead.utmMedium || "—"}
    </div>
</div>

       

<div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "5px",
        minWidth: 0,
        whiteSpace: "nowrap"
    }}
>
    <div
        style={{
            fontSize: "10px",
            fontWeight: 800,
            color: "#64748b"
        }}
    >
        UTM Campaign: 
    </div>

    <div
        style={{
            fontSize: "11px",
            color: "#334155",
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis"
        }}
    >
       {selectedLead.utmCampaign || "—"}
    </div>
</div>

    </div>

</div>



                        {/* NOTES */}

                        <div
                            style={{
    borderTop: "1px solid #e2e8f0",
    paddingTop: "12px",
    marginTop: "12px",
    marginBottom: "12px"
}}
                        >

                            <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        fontSize: "10px",
        fontWeight: 800,
        color: "#64748b",
        textTransform: "uppercase",
        marginBottom: "7px"
    }}
>
    <span
        style={{
            fontSize: "15px",
            lineHeight: 1
        }}
    >
        🗒️
    </span>

    Internal Notes
</div>


                            <div
    style={{
        padding: "8px 11px",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        background: "#f8fafc",
        fontSize: "11px",
        lineHeight: 1.5,
        color: "#334155",
        whiteSpace: "pre-wrap",
        textAlign: "left"
    }}
>
    {selectedLead.notes ||
        "No notes entered."}
</div>



{/* QUICK ACTIONS */}

<div
    style={{
    borderTop: "1px solid #e2e8f0",
    paddingTop: "12px",
    marginTop: "12px"
}}
>
    <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        fontSize: "10px",
        fontWeight: 800,
        color: "#64748b",
        textTransform: "uppercase",
        marginBottom: "8px"
    }}
>
    <span
        style={{
            fontSize: "15px",
            lineHeight: 1
        }}
    >
        ⚡
    </span>

    Quick Actions
</div>

    <div
        style={{
            display: "grid",
         gridTemplateColumns: "repeat(6, 1fr)",
            gap: "8px"
        }}
    >

        {/* WHATSAPP */}

        <button
            type="button"
            disabled={!selectedLead.mobile}
            onClick={() => {
                const mobile =
                    String(selectedLead.mobile || "")
                        .replace(/\D/g, "");

                if (!mobile) return;

                const whatsappNumber =
                    mobile.length === 10
                        ? `91${mobile}`
                        : mobile;

                window.open(
                    `https://wa.me/${whatsappNumber}`,
                    "_blank"
                );
            }}
            style={{
                border: "1px solid #dbe3ea",
                background: "#f8fafc",
                color: "#334155",
                borderRadius: "7px",
                padding: "9px 6px",
                cursor: selectedLead.mobile
                    ? "pointer"
                    : "default",
                fontSize: "11px",
                fontWeight: 700,
                opacity: selectedLead.mobile
                    ? 1
                    : 0.45
            }}
       >
    <span style={{ fontSize: "14px" }}>💬</span>
    WhatsApp
</button>


{/* AI TRAVEL PROPOSAL */}

<button
    type="button"
 onClick={() => {
    setAIProposalInputs({
        customer: selectedLead?.name || "",
        destination: selectedLead?.destination || "",
        travelMonth: selectedLead?.preferredMonth || "",
        duration: "",
        adults: selectedLead?.adults || 0,
        children: selectedLead?.children || 0,

        accommodationAdultPerNight: "",
        transferPerDay: "",

        travelFrom: selectedLead?.travelFrom || "",
        travelTo: selectedLead?.travelTo || "",

        travellerType: "",
        travelTheme: "",
        themeDetails: "",
        travelPace: "AI Recommended",
        accommodationPreference: "AI Recommended",
        transportPreference: "AI Recommended",

        mustVisit: [],
        specialPreferences: [],
        avoidPreferences: [],

        requirement:
            selectedLead?.requirement ||
            selectedLead?.notes ||
            ""
    });

    setAIProposalLeadId(
        selectedLead?.id || null
    );

    setAIProposalResult(null);
setAIProposalPreviewMode(false);
setAIProposalEditing(false);
setShowAIWhatsAppEditor(false);

    setShowAIProposal(true);
}}

    
    style={{
        border: "1px solid #dbe3ea",
        background: "#f8fafc",
        color: "#334155",
        borderRadius: "7px",
        padding: "9px 6px",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: 700
    }}
>
   <span style={{ fontSize: "14px" }}>✨</span>
Create Proposal
</button>



{/* RESUME PROPOSAL */}

<button
    type="button"
    disabled={!hasSavedAIProposal}
    onClick={() => {
    const leadId = selectedLead?.id;

    if (!leadId) {
        return;
    }

    const storageKey =
        getAIProposalStorageKey(leadId);

    if (!storageKey) {
        return;
    }

    try {
        const saved =
            localStorage.getItem(storageKey);

        if (!saved) {
            alert(
                "No saved proposal was found for this Lead."
            );
            return;
        }

        const savedProposal =
            JSON.parse(saved);

        setAIProposalLeadId(leadId);
        setAIProposalResult(savedProposal);

        setAIProposalInputs({
            customer:
                selectedLead?.name || "",
            destination:
                selectedLead?.destination || "",
            travelMonth:
                selectedLead?.preferredMonth || "",
            duration: "",
            adults:
                selectedLead?.adults || 0,
            children:
                selectedLead?.children || 0,

            accommodationAdultPerNight: "",
            transferPerDay: "",

            travelFrom:
                selectedLead?.travelFrom || "",

            travelTo:
                selectedLead?.travelTo || "",

            travellerType: "",
            travelTheme: "",
            themeDetails: "",
            travelPace: "AI Recommended",
            accommodationPreference: "AI Recommended",
            transportPreference: "AI Recommended",

            mustVisit: [],
            specialPreferences: [],
            avoidPreferences: [],

            requirement:
                selectedLead?.requirement ||
                selectedLead?.notes ||
                ""
        });

        setAIProposalPreviewMode(false);
        setAIProposalEditing(false);
        setShowAIProposal(false);
        setShowAIWhatsAppEditor(true);

    } catch (error) {
        console.error(
            "Could not resume AI proposal:",
            error
        );

        alert(
            "Could not resume the saved proposal."
        );
    }
}}
    style={{
        border: "1px solid #dbe3ea",
       background:
    hasSavedAIProposal
        ? "#f8fafc"
        : "#f1f5f9",
        color:
    hasSavedAIProposal
        ? "#334155"
        : "#94a3b8",
        borderRadius: "7px",
        padding: "9px 6px",
        cursor:
    hasSavedAIProposal
        ? "pointer"
        : "default",
        fontSize: "11px",
        fontWeight: 700
    }}
>
    <span style={{ fontSize: "14px" }}>↻</span>
    Resume Proposal
</button>



 
      {/* CALL */}

        <button
            type="button"
            disabled={!selectedLead.mobile}
            onClick={() => {
                if (!selectedLead.mobile) return;

                window.location.href =
                    `tel:${selectedLead.mobile}`;
            }}
            style={{
                border: "1px solid #dbe3ea",
                background: "#f8fafc",
                color: "#334155",
                borderRadius: "7px",
                padding: "9px 6px",
                cursor: selectedLead.mobile
                    ? "pointer"
                    : "default",
                fontSize: "11px",
                fontWeight: 700,
                opacity: selectedLead.mobile
                    ? 1
                    : 0.45
            }}
       >
    <span style={{ fontSize: "14px" }}>📞</span>
    Call
</button>

        {/* EMAIL */}

       <button
    type="button"
    disabled={!String(selectedLead.email || "").trim()}
    onClick={async () => {

    const email =
        String(
            selectedLead.email || ""
        ).trim();

    if (!email) return;

    try {

        const response =
            await fetch(
                "http://127.0.0.1:38765/prepare-email",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        email
                    })
                }
            );

        const result =
            await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.error ||
                "Unable to open Gmail."
            );
        }

    } catch (error) {

        console.error(
            "Gmail preparation failed:",
            error
        );

        alert(
            "Unable to open Orbitz Gmail. Please make sure Orbitz Helper is running."
        );
    }
}}
    style={{
        border: "1px solid #dbe3ea",
        background: "#f8fafc",
        color: "#334155",
        borderRadius: "7px",
        padding: "9px 6px",
        cursor: String(selectedLead.email || "").trim()
            ? "pointer"
            : "default",
        fontSize: "11px",
        fontWeight: 700,
        opacity: String(selectedLead.email || "").trim()
            ? 1
            : 0.45
    }}
>
    <span style={{ fontSize: "14px" }}>✉️</span>
    Email
</button>

        {/* FOLLOW-UP */}

        <button
            type="button"
            onClick={() => {
                setEditingLead({
                    ...selectedLead
                });
            }}
            style={{
                border: "1px solid #dbe3ea",
                background: "#f8fafc",
                color: "#334155",
                borderRadius: "7px",
                padding: "9px 6px",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: 700
            }}
        >
    <span style={{ fontSize: "14px" }}>📅</span>
    Follow-up
</button>

    </div>
</div>

                            
 
                        </div>

                        </>  

                         )}   

                    </div>

                </div>
            )}


            {showClientLinker && selectedLead && (
    <div
        style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: "420px",
            maxWidth: "90vw",
            background: "#fff",
            boxShadow:
                "-8px 0 30px rgba(15, 23, 42, 0.16)",
            borderLeft: "1px solid #dbe3ea",
            zIndex: 1002,
            display: "flex",
            flexDirection: "column"
        }}
    >
        <div
            style={{
                minHeight: "58px",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #e2e8f0",
                background: "#f8fafc"
            }}
        >
            <div>
                <div
                    style={{
                        fontSize: "15px",
                        fontWeight: 800,
                        color: "#172033"
                    }}
                >
                    Create / Link Client
                </div>

                <div
                    style={{
                        marginTop: "2px",
                        fontSize: "11px",
                        color: "#64748b"
                    }}
                >
                   Lead:{" "}
{linkedClient?.client?.clientName ||
    selectedLead.name ||
    "—"}
                </div>
            </div>

            <button
                type="button"
                onClick={() =>
                    setShowClientLinker(false)
                }
                style={{
                    width: "30px",
                    height: "30px",
                    border: "none",
                    borderRadius: "7px",
                    background: "#e2e8f0",
                    color: "#334155",
                    cursor: "pointer",
                    fontSize: "18px"
                }}
            >
                ×
            </button>
        </div>

        <div
            style={{
                flex: 1,
                overflowY: "auto",
                padding: "18px"
            }}
        >
            {linkedClient?.possibleClients?.length > 0 ? (
                <div>
                    <div
                        style={{
                            fontSize: "12px",
                            fontWeight: 800,
                            color: "#334155",
                            marginBottom: "8px"
                        }}
                    >
                        Possible Existing Client
                    </div>

                    <div
                        style={{
                            padding: "12px",
                            border: "1px solid #dbe3ea",
                            borderRadius: "8px",
                            background: "#f8fafc"
                        }}
                    >
                        {linkedClient.possibleClients.map(
                            client => (
                                <div
                                    key={client.id}
                                    style={{
                                        marginBottom: "10px"
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: 800,
                                            color: "#172033"
                                        }}
                                    >
                                        {client.clientName}
                                    </div>

                                    <div
                                        style={{
                                            marginTop: "3px",
                                            fontSize: "11px",
                                            color: "#64748b"
                                        }}
                                    >
                                        {client.clientId}
                                    </div>

                                    <div
                                        style={{
                                            marginTop: "3px",
                                            fontSize: "12px",
                                            color: "#475569"
                                        }}
                                    >
                                        📞 {client.mobile || "—"}
                                    </div>

                                    {client.matchReasons?.length > 0 && (
    <div
        style={{
            marginTop: "7px",
            fontSize: "10px",
            color: "#0f766e",
            fontWeight: 700
        }}
    >
        Match found:{" "}
        {client.matchReasons.join(" + ")}
    </div>
)}

<button
    type="button"
    onClick={async () => {
        try {
            await updateLead(
    selectedLead.id,
    {
        clientId: client.clientId,
        clientDocId: client.id,
        clientRelationshipType:
            "existing"
    }
);

            setLeads(previous =>
                previous.map(lead =>
                    lead.id === selectedLead.id
                        ? {
                            ...lead,
                            clientId: client.clientId,
                            clientDocId: client.id
                        }
                        : lead
                )
            );

            setSelectedLead(previous =>
                previous
                    ? {
                        ...previous,
                        clientId: client.clientId,
                        clientDocId: client.id
                    }
                    : previous
            );

            setLinkedClient({
                client,
                possibleClients: [],
                relationshipType: "existing"
            });

            setShowClientLinker(false);

        } catch (error) {
            console.error(
                "Failed to link existing client:",
                error
            );

            alert(
                "Unable to link existing client. Please try again."
            );
        }
    }}
    style={{
        marginTop: "10px",
        width: "100%",
        padding: "8px 10px",
        border: "1px solid #0f766e",
        borderRadius: "6px",
        background: "#f0fdfa",
        color: "#0f766e",
        fontSize: "11px",
        fontWeight: 700,
        cursor: "pointer"
    }}
>
    🔗 Link This Client
</button>

                                </div>
                            )
                        )}
                    </div>
                </div>
           ) : (
    <div>
        <div
            style={{
                padding: "14px",
                border: "1px solid #dbe3ea",
                borderRadius: "8px",
                background: "#f8fafc",
                fontSize: "12px",
                color: "#64748b",
                lineHeight: 1.5,
                marginBottom: "14px"
            }}
        >
            No possible existing client was found
            using the Lead mobile number.
        </div>

        <button
            type="button"
            onClick={() => {
                setEditingClient({
                    clientId: "",
                   clientName:
    linkedClient?.client?.clientName ||
    selectedLead.name ||
    "",

contactPerson:
    linkedClient?.client?.clientName ||
    selectedLead.name ||
    "",
                    mobile:
                        selectedLead.mobile || "",
                    email:
                        selectedLead.email || "",
                    clientType:
                        "Individual",
                    status:
                        "Active",
                    city: "",
                    address: "",
                    source:
                        selectedLead.source || "",
                    notes: ""
                });

                setShowClientLinker(false);
            }}
            style={{
                width: "100%",
                background: "#0f766e",
                color: "#fff",
                border: "none",
                borderRadius: "7px",
                padding: "10px 14px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 700
            }}
        >
            ＋ Create New Client
        </button>
    </div>
)}





        </div>
    </div>
)}



{showAIProposal && selectedLead && (

    
    <div
        style={{
            position: "fixed",
            top: "4vh",
            left: "50%",
            transform: "translateX(-50%)",
            width: "1080px",
            maxWidth: "94vw",
            height: "92vh",
            maxHeight: "92vh",
            background: "#fff",
            border: "1px solid #dbe3ea",
            borderRadius: "16px",
            boxShadow:
                "0 20px 60px rgba(15, 23, 42, 0.24)",
            zIndex: 1005,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
        }}
    >

        {/* HEADER */}

        <div
            style={{
                minHeight: "62px",
                padding: "10px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #e2e8f0",
                background: "#f8fafc"
            }}
        >

            <div>

                <div
                    style={{
                        fontSize: "16px",
                        fontWeight: 800,
                        color: "#172033"
                    }}
                >
                    ✨ Travel Proposal
                </div>

                <div
                    style={{
                        marginTop: "3px",
                        fontSize: "11px",
                        color: "#64748b"
                    }}
                >
                    Lead:{" "}
{linkedClient?.client?.clientName ||
    selectedLead.name ||
    "—"}
{"  •  "}
                    {selectedLead.destination ||
                        "Destination not specified"}
                </div>

            </div>


          



            <button
                type="button"
                onClick={() =>
                    setShowAIProposal(false)
                }
                style={{
                    width: "32px",
                    height: "32px",
                    border: "none",
                    borderRadius: "7px",
                    background: "#e2e8f0",
                    color: "#334155",
                    cursor: "pointer",
                    fontSize: "19px",
                    lineHeight: 1
                }}
            >
                ×
            </button>

        </div>


        {/* CONTENT */}

        <div
    ref={el => {
        if (el) {
            console.log(
                "AI CONTENT:",
                "width =", el.clientWidth,
                "left =", el.getBoundingClientRect().left,
                "right =", el.getBoundingClientRect().right
            );
        }
    }}
   style={{
    flex: 1,
    minWidth: 0,
    width: "100%",
    overflowY: "scroll",
    padding: "18px",
    boxSizing: "border-box"
}}
>

            <div
                style={{
                    marginBottom: "14px",
                    fontSize: "12px",
                    color: "#64748b"
                }}
            >
                Review the information below before
                generating the AI travel proposal.
            </div>


{!aiProposalPreviewMode && (
    <>
        {/* PROPOSAL INPUTS */}

            <div
                style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    background: "#f8fafc",
                    padding: "14px"
                }}
            >

                <div
                    style={{
                        fontSize: "13px",
                        fontWeight: 800,
                        color: "#172033",
                        marginBottom: "12px"
                    }}
                >
                    Proposal Inputs
                </div>


                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(4, minmax(0, 1fr))",
                        gap: "12px"
                    }}
                >

                   {/* CUSTOMER */}
<div>
    <div style={{
        fontSize: "10px",
        fontWeight: 700,
        color: "#64748b",
        marginBottom: "4px"
    }}>
        Customer
    </div>
    <input
        value={aiProposalInputs?.customer || ""}
        onChange={e =>
            setAIProposalInputs(prev => ({
                ...prev,
                customer: e.target.value
            }))
        }
        style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "7px 8px",
            fontSize: "12px",
            color: "#334155",
            background: "#fff"
        }}
    />
</div>

{/* DESTINATION */}
<div>
    <div style={{
        fontSize: "10px",
        fontWeight: 700,
        color: "#64748b",
        marginBottom: "4px"
    }}>
        Destination
    </div>
    <input
        value={aiProposalInputs?.destination || ""}
        onChange={e => {
    const destination = e.target.value;

    setAIProposalInputs(prev => ({
        ...prev,
        destination,
        mustVisit: []
    }));
}}
        style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "7px 8px",
            fontSize: "12px",
            color: "#334155",
            background: "#fff"
        }}
    />
</div>

{/* TRAVEL MONTH */}
<div>
    <div style={{
        fontSize: "10px",
        fontWeight: 700,
        color: "#64748b",
        marginBottom: "4px"
    }}>
        Travel Month
    </div>
    <input
        value={aiProposalInputs?.travelMonth || ""}
        onChange={e =>
            setAIProposalInputs(prev => ({
                ...prev,
                travelMonth: e.target.value
            }))
        }
        placeholder="e.g. October 2026"
        style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "7px 8px",
            fontSize: "12px",
            color: "#334155",
            background: "#fff"
        }}
    />
</div>



{/* DURATION */}
<div>
    <div style={{
        fontSize: "10px",
        fontWeight: 700,
        color: "#64748b",
        marginBottom: "4px"
    }}>
        Duration
    </div>

    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "7px"
        }}
    >
        <input
            type="number"
            min="1"
            value={aiProposalInputs?.duration || ""}
            onChange={e =>
                setAIProposalInputs(prev => ({
                    ...prev,
                    duration: e.target.value
                }))
            }
            placeholder="e.g. 6"
            style={{
                width: "100%",
                boxSizing: "border-box",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                padding: "7px 8px",
                fontSize: "12px",
                color: "#334155",
                background: "#fff"
            }}
        />

        <span
            style={{
                fontSize: "11px",
                color: "#64748b",
                whiteSpace: "nowrap"
            }}
        >
            Nights
        </span>
    </div>
</div>




{/* ADULTS */}
<div>
    <div style={{
        fontSize: "10px",
        fontWeight: 700,
        color: "#64748b",
        marginBottom: "4px"
    }}>
        Adults
    </div>
    <input
        type="number"
        min="0"
        value={aiProposalInputs?.adults ?? 0}
        onChange={e =>
            setAIProposalInputs(prev => ({
                ...prev,
                adults: Number(e.target.value)
            }))
        }
        style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "7px 8px",
            fontSize: "12px",
            color: "#334155",
            background: "#fff"
        }}
    />
</div>

{/* CHILDREN */}
<div>
    <div style={{
        fontSize: "10px",
        fontWeight: 700,
        color: "#64748b",
        marginBottom: "4px"
    }}>
        Children
    </div>
    <input
        type="number"
        min="0"
        value={aiProposalInputs?.children ?? 0}
        onChange={e =>
            setAIProposalInputs(prev => ({
                ...prev,
                children: Number(e.target.value)
            }))
        }
        style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "7px 8px",
            fontSize: "12px",
            color: "#334155",
            background: "#fff"
        }}
    />
</div>




{/* PLANNING BUDGET */}
<div>
    <div style={{
        fontSize: "10px",
        fontWeight: 700,
        color: "#64748b",
        marginBottom: "4px"
    }}>
        Planning Budget
    </div>

    <div
        style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "7px"
        }}
    >

       {/* CP ACCOMMODATION / ADULT / NIGHT */}
<div>
    <input
        type="number"
        min="0"
        value={
            aiProposalInputs?.accommodationAdultPerNight || ""
        }
        onChange={e =>
            setAIProposalInputs(prev => ({
                ...prev,
                accommodationAdultPerNight:
                    e.target.value
            }))
        }
        placeholder="CP Accommodation / Adult / Night"
        title="Twin Share"
        style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "7px 8px",
            fontSize: "12px",
            color: "#334155",
            background: "#fff"
        }}
    />
    <div
        style={{
            marginTop: "3px",
            fontSize: "9px",
            color: "#94a3b8"
        }}
    >
        Twin Share
    </div>
</div>

{/* TRANSFER / DAY */}
<div>
    <input
        type="number"
        min="0"
        value={
            aiProposalInputs?.transferPerDay || ""
        }
        onChange={e =>
            setAIProposalInputs(prev => ({
                ...prev,
                transferPerDay:
                    e.target.value
            }))
        }
        placeholder="Transfer / Day"
        style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "7px 8px",
            fontSize: "12px",
            color: "#334155",
            background: "#fff"
        }}
    />
</div>

    </div>
</div>




{/* TRAVEL FROM */}
<div>
    <div style={{
        fontSize: "10px",
        fontWeight: 700,
        color: "#64748b",
        marginBottom: "4px"
    }}>
        Travel From
    </div>
    <input
        value={aiProposalInputs?.travelFrom || ""}
        onChange={e =>
            setAIProposalInputs(prev => ({
                ...prev,
                travelFrom: e.target.value
            }))
        }
        placeholder="e.g. Kolkata"
        style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "7px 8px",
            fontSize: "12px",
            color: "#334155",
            background: "#fff"
        }}
    />
</div>

{/* TRAVEL TO */}
<div>
    <div style={{
        fontSize: "10px",
        fontWeight: 700,
        color: "#64748b",
        marginBottom: "4px"
    }}>
        Travel To
    </div>
    <input
        value={aiProposalInputs?.travelTo || ""}
        onChange={e =>
            setAIProposalInputs(prev => ({
                ...prev,
                travelTo: e.target.value
            }))
        }
        placeholder="e.g. Kochi"
        style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "7px 8px",
            fontSize: "12px",
            color: "#334155",
            background: "#fff"
        }}
    />
</div>

{/* TRAVELLER TYPE */}
<div>
    <div
        style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#64748b",
            marginBottom: "4px"
        }}
    >
        Traveller Type
    </div>

    <select
        value={aiProposalInputs?.travellerType || ""}
        onChange={e =>
            setAIProposalInputs(prev => ({
                ...prev,
                travellerType: e.target.value
            }))
        }
        style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "7px 8px",
            fontSize: "12px",
            color: "#334155",
            background: "#fff"
        }}
    >
        <option value="">Select</option>
        <option value="Family">Family</option>
        <option value="Couple">Couple</option>
        <option value="Honeymoon">Honeymoon</option>
        <option value="Friends">Friends</option>
        <option value="Solo">Solo</option>
        <option value="Senior Citizens">Senior Citizens</option>
        <option value="Family with Children">
            Family with Children
        </option>
        <option value="Corporate / Group">
            Corporate / Group
        </option>
        <option value="Other">Other</option>
    </select>
</div>

{/* TRAVEL THEME / OCCASION */}
<div>
    <div
        style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#64748b",
            marginBottom: "4px"
        }}
    >
        Travel Theme / Occasion
    </div>

    <select
        value={aiProposalInputs?.travelTheme || ""}
        onChange={e =>
            setAIProposalInputs(prev => ({
                ...prev,
                travelTheme: e.target.value
            }))
        }
        style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "7px 8px",
            fontSize: "12px",
            color: "#334155",
            background: "#fff"
        }}
    >
        <option value="">No Specific Theme</option>
        <option value="Festival / Celebration">
            Festival / Celebration
        </option>
        <option value="Seasonal Experience">
            Seasonal Experience
        </option>
        <option value="Flower / Nature Season">
            Flower / Nature Season
        </option>
        <option value="Honeymoon">Honeymoon</option>
        <option value="Family Holiday">
            Family Holiday
        </option>
        <option value="Adventure">Adventure</option>
        <option value="Wildlife">Wildlife</option>
        <option value="Spiritual / Pilgrimage">
            Spiritual / Pilgrimage
        </option>
        <option value="Cultural Experience">
            Cultural Experience
        </option>
        <option value="Food & Culinary">
            Food & Culinary
        </option>
        <option value="Shopping">Shopping</option>
        <option value="Luxury Experience">
            Luxury Experience
        </option>
        <option value="Custom">Custom</option>
    </select>
</div>

{/* TRAVEL PACE */}
<div>
    <div
        style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#64748b",
            marginBottom: "4px"
        }}
    >
        Travel Pace
    </div>

    <select
        value={aiProposalInputs?.travelPace || "AI Recommended"}
        onChange={e =>
            setAIProposalInputs(prev => ({
                ...prev,
                travelPace: e.target.value
            }))
        }
        style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "7px 8px",
            fontSize: "12px",
            color: "#334155",
            background: "#fff"
        }}
    >
        <option value="AI Recommended">
            AI Recommended
        </option>
        <option value="Relaxed">Relaxed</option>
        <option value="Balanced">Balanced</option>
        <option value="Active">Active</option>
    </select>
</div>


{/* ACCOMMODATION PREFERENCE */}
<div>
    <div
        style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#64748b",
            marginBottom: "4px"
        }}
    >
        Accommodation Preference
    </div>

    <select
        value={
            aiProposalInputs?.accommodationPreference ||
            "AI Recommended"
        }
        onChange={e =>
            setAIProposalInputs(prev => ({
                ...prev,
                accommodationPreference: e.target.value
            }))
        }
        style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "7px 8px",
            fontSize: "12px",
            color: "#334155",
            background: "#fff"
        }}
    >
        <option value="AI Recommended">
            AI Recommended
        </option>
        <option value="Budget">Budget</option>
        <option value="Standard">Standard</option>
        <option value="Premium">Premium</option>
        <option value="Luxury">Luxury</option>
        <option value="Villa / Resort">
            Villa / Resort
        </option>
    </select>
</div>

{/* TRANSPORT PREFERENCE */}
<div>
    <div
        style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#64748b",
            marginBottom: "4px"
        }}
    >
        Transport Preference
    </div>

    <select
        value={
            aiProposalInputs?.transportPreference ||
            "AI Recommended"
        }
        onChange={e =>
            setAIProposalInputs(prev => ({
                ...prev,
                transportPreference: e.target.value
            }))
        }
        style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "7px 8px",
            fontSize: "12px",
            color: "#334155",
            background: "#fff"
        }}
    >
        <option value="AI Recommended">
            AI Recommended
        </option>
        <option value="Flight">Flight</option>
        <option value="Train">Train</option>
        <option value="Road">Road</option>
        <option value="Flight + Road">
            Flight + Road
        </option>
    </select>
</div>


<div
    style={{
        marginTop: "14px",
        display: "grid",
        gridColumn: "1 / -1",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "12px"
    }}
>
    {/* MUST VISIT */}
<div>
    <div
        style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#64748b",
            marginBottom: "4px"
        }}
    >
        Must Visit
    </div>

    <select
        value=""
        onChange={e => {
            const value = e.target.value;

            if (!value) return;

            setAIProposalInputs(prev => {
                if (value === "AI Recommended") {
                    return {
                        ...prev,
                        mustVisit: ["AI Recommended"]
                    };
                }

                if (value === "Custom") {
                    return prev;
                }

                if ((prev.mustVisit || []).includes(value)) {
                    return prev;
                }

                return {
                    ...prev,
                    mustVisit: [
                        ...(prev.mustVisit || []).filter(
                            item => item !== "AI Recommended"
                        ),
                        value
                    ]
                };
            });
        }}
        style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "7px 8px",
            fontSize: "12px",
            color: "#334155",
            background: "#fff"
        }}
    >
        <option value="">Select...</option>

<option value="AI Recommended">
    ✨ AI Recommended
</option>

{(
    MUST_VISIT_OPTIONS[
        Object.keys(MUST_VISIT_OPTIONS).find(
            key =>
                key.toLowerCase().trim() ===
                String(
                    aiProposalInputs?.destination || ""
                ).toLowerCase().trim()
        )
    ] || []
).map(place => (
    <option
        key={place}
        value={place}
    >
        {place}
    </option>
))}
    </select>

    {aiProposalInputs?.mustVisit?.length > 0 && (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "5px",
                marginTop: "7px"
            }}
        >
            {aiProposalInputs.mustVisit.map(item => (
                <span
                    key={item}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 7px",
                        borderRadius: "12px",
                        background: "#f1f5f9",
                        border: "1px solid #dbe3ea",
                        fontSize: "10px",
                        color: "#334155"
                    }}
                >
                    {item}

                    <button
                        type="button"
                        onClick={() =>
                            setAIProposalInputs(prev => ({
                                ...prev,
                                mustVisit:
                                    (prev.mustVisit || []).filter(
                                        value => value !== item
                                    )
                            }))
                        }
                        style={{
                            border: "none",
                            background: "transparent",
                            padding: 0,
                            cursor: "pointer",
                            color: "#64748b",
                            fontSize: "11px"
                        }}
                    >
                        ×
                    </button>
                </span>
            ))}
        </div>
    )}

    <input
        type="text"
        placeholder="Add custom place / experience and press Enter"
        onKeyDown={e => {
            if (e.key !== "Enter") return;

            const value = e.target.value.trim();

            if (!value) return;

            setAIProposalInputs(prev => ({
                ...prev,
                mustVisit: [
                    ...(prev.mustVisit || []).filter(
                        item => item !== "AI Recommended"
                    ),
                    value
                ]
            }));

            e.target.value = "";
        }}
        style={{
            width: "100%",
            boxSizing: "border-box",
            marginTop: "7px",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            padding: "7px 8px",
            fontSize: "11px",
            color: "#334155"
        }}
    />
</div>

   {/* SPECIAL PREFERENCES */}
<div>
    <div
        style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#64748b",
            marginBottom: "4px"
        }}
    >
        Special Preferences
    </div>

    <select
        value=""
        onChange={e => {
            const value = e.target.value;

            if (!value) return;

            setAIProposalInputs(prev => {
                if ((prev.specialPreferences || []).includes(value)) {
                    return prev;
                }

                return {
                    ...prev,
                    specialPreferences: [
                        ...(prev.specialPreferences || []),
                        value
                    ]
                };
            });
        }}
        style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "7px 8px",
            fontSize: "12px",
            color: "#334155",
            background: "#fff"
        }}
    >
        <option value="">Select...</option>
        <option value="Nature / Scenic">
            🌿 Nature / Scenic
        </option>
        <option value="Photography">
            📸 Photography
        </option>
        <option value="Food & Culinary">
            🍜 Food & Culinary
        </option>
        <option value="Shopping">
            🛍️ Shopping
        </option>
        <option value="Culture & Heritage">
            🏛️ Culture & Heritage
        </option>
        <option value="Adventure">
            🏔️ Adventure
        </option>
        <option value="Wildlife">
            🐘 Wildlife
        </option>
        <option value="Beaches">
            🏖️ Beaches
        </option>
        <option value="Nightlife">
            🌃 Nightlife
        </option>
        <option value="Family Friendly">
            👨‍👩‍👧 Family Friendly
        </option>
        <option value="Romantic">
            💕 Romantic
        </option>
        <option value="Relaxation">
            🧘 Relaxation
        </option>
        <option value="Spiritual / Pilgrimage">
            🛕 Spiritual / Pilgrimage
        </option>
        <option value="Festivals / Events">
            🎉 Festivals / Events
        </option>
        <option value="Vegetarian / Food Preference">
            🍽️ Vegetarian / Food Preference
        </option>
        <option value="Child Friendly">
            👶 Child Friendly
        </option>
    </select>

    {aiProposalInputs?.specialPreferences?.length > 0 && (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "5px",
                marginTop: "7px"
            }}
        >
            {aiProposalInputs.specialPreferences.map(item => (
                <span
                    key={item}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 7px",
                        borderRadius: "12px",
                        background: "#f1f5f9",
                        border: "1px solid #dbe3ea",
                        fontSize: "10px",
                        color: "#334155"
                    }}
                >
                    {item}

                    <button
                        type="button"
                        onClick={() =>
                            setAIProposalInputs(prev => ({
                                ...prev,
                                specialPreferences:
                                    (prev.specialPreferences || []).filter(
                                        value => value !== item
                                    )
                            }))
                        }
                        style={{
                            border: "none",
                            background: "transparent",
                            padding: 0,
                            cursor: "pointer",
                            color: "#64748b",
                            fontSize: "11px"
                        }}
                    >
                        ×
                    </button>
                </span>
            ))}
        </div>
    )}

    <input
        type="text"
        placeholder="Add custom preference and press Enter"
        onKeyDown={e => {
            if (e.key !== "Enter") return;

            const value = e.target.value.trim();

            if (!value) return;

            setAIProposalInputs(prev => ({
                ...prev,
                specialPreferences: [
                    ...(prev.specialPreferences || []),
                    value
                ]
            }));

            e.target.value = "";
        }}
        style={{
            width: "100%",
            boxSizing: "border-box",
            marginTop: "7px",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            padding: "7px 8px",
            fontSize: "11px",
            color: "#334155"
        }}
    />
</div>

    {/* AVOID / NOT INTERESTED IN */}
<div>
    <div
        style={{
            fontSize: "10px",
            fontWeight: 700,
            color: "#64748b",
            marginBottom: "4px"
        }}
    >
        Avoid / Not Interested In
    </div>

    <select
        value=""
        onChange={e => {
            const value = e.target.value;

            if (!value) return;

            setAIProposalInputs(prev => {
                if ((prev.avoidPreferences || []).includes(value)) {
                    return prev;
                }

                return {
                    ...prev,
                    avoidPreferences: [
                        ...(prev.avoidPreferences || []),
                        value
                    ]
                };
            });
        }}
        style={{
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "7px 8px",
            fontSize: "12px",
            color: "#334155",
            background: "#fff"
        }}
    >
        <option value="">Select...</option>
        <option value="Long travel days">
            Long travel days
        </option>
        <option value="Too many hotel changes">
            Too many hotel changes
        </option>
        <option value="Early morning departures">
            Early morning departures
        </option>
        <option value="Very packed sightseeing">
            Very packed sightseeing
        </option>
        <option value="Adventure activities">
            Adventure activities
        </option>
        <option value="Shopping">
            Shopping
        </option>
        <option value="Nightlife">
            Nightlife
        </option>
        <option value="Crowded attractions">
            Crowded attractions
        </option>
        <option value="High-altitude routes">
            High-altitude routes
        </option>
        <option value="Long walking">
            Long walking
        </option>
        <option value="Boat rides">
            Boat rides
        </option>
        <option value="Wildlife activities">
            Wildlife activities
        </option>
        <option value="Religious sites">
            Religious sites
        </option>
        <option value="Theme parks">
            Theme parks
        </option>
    </select>

    {aiProposalInputs?.avoidPreferences?.length > 0 && (
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "5px",
                marginTop: "7px"
            }}
        >
            {aiProposalInputs.avoidPreferences.map(item => (
                <span
                    key={item}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 7px",
                        borderRadius: "12px",
                        background: "#fef2f2",
                        border: "1px solid #fecaca",
                        fontSize: "10px",
                        color: "#7f1d1d"
                    }}
                >
                    {item}

                    <button
                        type="button"
                        onClick={() =>
                            setAIProposalInputs(prev => ({
                                ...prev,
                                avoidPreferences:
                                    (prev.avoidPreferences || []).filter(
                                        value => value !== item
                                    )
                            }))
                        }
                        style={{
                            border: "none",
                            background: "transparent",
                            padding: 0,
                            cursor: "pointer",
                            color: "#991b1b",
                            fontSize: "11px"
                        }}
                    >
                        ×
                    </button>
                </span>
            ))}
        </div>
    )}

    <input
        type="text"
        placeholder="Add custom avoidance and press Enter"
        onKeyDown={e => {
            if (e.key !== "Enter") return;

            const value = e.target.value.trim();

            if (!value) return;

            setAIProposalInputs(prev => ({
                ...prev,
                avoidPreferences: [
                    ...(prev.avoidPreferences || []),
                    value
                ]
            }));

            e.target.value = "";
        }}
        style={{
            width: "100%",
            boxSizing: "border-box",
            marginTop: "7px",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            padding: "7px 8px",
            fontSize: "11px",
            color: "#334155"
        }}
    />
</div>
</div>





                </div>

            </div>


            {/* REQUIREMENT / NOTES */}

            <div
                style={{
                    marginTop: "14px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    padding: "14px",
                    background: "#fff"
                }}
            >

                <div
                    style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        color: "#64748b",
                        marginBottom: "6px"
                    }}
                >
                    REQUIREMENT / NOTES
                </div>

                <textarea
    value={aiProposalInputs?.requirement || ""}
    onChange={e =>
        setAIProposalInputs(prev => ({
            ...prev,
            requirement: e.target.value
        }))
    }
    placeholder="Enter any requirement, preference or planning note for this proposal..."
    rows={4}
    style={{
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid #cbd5e1",
        borderRadius: "7px",
        padding: "9px 10px",
        fontSize: "12px",
        lineHeight: 1.5,
        color: "#334155",
        background: "#fff",
        resize: "vertical",
        fontFamily: "inherit"
    }}
/>

            </div>
              </>
)}


           {aiProposalResult && aiProposalPreviewMode && (
   <div
    ref={el => {
        if (el) {
            console.log(
                "STAFF PREVIEW OUTER:",
                "width =", el.clientWidth,
                "left =", el.getBoundingClientRect().left,
                "right =", el.getBoundingClientRect().right
            );
        }
    }}
    style={{
        marginTop: "18px",
        border: "1px solid #dbe3ec",
        borderRadius: "10px",
        background: "#f8fafc",
        padding: "16px"
    }}
>
        <div
            style={{
                fontSize: "13px",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "14px"
            }}
        >
            ✨ Staff Preview
        </div>

        <div
    ref={el => {
        if (el) {
            console.log(
                "STAFF PREVIEW CARD:",
                "width =", el.clientWidth,
                "left =", el.getBoundingClientRect().left,
                "right =", el.getBoundingClientRect().right
            );
        }
    }}
    style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "9px",
        padding: "12px"
    }}
>
            <div
                style={{
                    fontSize: "13px",
                    lineHeight: 1.6,
                    color: "#334155",
                    whiteSpace: "pre-line",
                    marginBottom: "8px"
                }}
            >
                {aiProposalResult.customerGreeting}
            </div>

           <div
    style={{
        position: "relative",
        width: "100%",
        fontSize: "18px",
        fontWeight: 800,
        color: "#0f172a",
        marginBottom: "8px",
        boxSizing: "border-box"
    }}
>
    <div
        style={{
            visibility: aiProposalEditing ? "hidden" : "visible",
            minHeight: "28px",
            lineHeight: 1.2
        }}
    >
        {aiProposalResult.proposalTitle || ""}
    </div>

    {aiProposalEditing && (
        <input
            type="text"
            value={aiProposalResult.proposalTitle || ""}
            onChange={e =>
                setAIProposalResult(prev => ({
                    ...prev,
                    proposalTitle: e.target.value
                }))
            }
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "28px",
                border: "1px solid #cbd5e1",
                borderRadius: "5px",
                padding: "2px 5px",
                margin: 0,
                fontSize: "18px",
                fontWeight: 800,
                lineHeight: 1.2,
                color: "#0f172a",
                background: "#fff",
                boxSizing: "border-box",
                outline: "none"
            }}
        />
    )}
</div>

            <div
                style={{
                    display: "grid",
                   gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                    gap: "7px",
                    marginBottom: "10px"
                }}
            >
                <div>
                    <div style={{ fontSize: "10px", color: "#64748b" }}>
                        Destination
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: 700 }}>
                        {aiProposalResult.tripOverview.destination || "-"}
                    </div>
                </div>

                <div>
                    <div style={{ fontSize: "10px", color: "#64748b" }}>
                        Suggested Duration
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: 700 }}>
                        {aiProposalResult.tripOverview.suggestedDuration || "-"}
                    </div>
                </div>

                <div>
                    <div style={{ fontSize: "10px", color: "#64748b" }}>
                        Travel Window
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: 700 }}>
                        {aiProposalResult.tripOverview.recommendedTravelWindow ||
                            aiProposalResult.tripOverview.requestedTravelWindow ||
                            "-"}
                    </div>
                </div>

                <div>
                    <div style={{ fontSize: "10px", color: "#64748b" }}>
                        Travellers
                    </div>
                    <div style={{ fontSize: "12px", fontWeight: 700 }}>
                        {aiProposalResult.tripOverview.travellers.adults} Adults
                        {aiProposalResult.tripOverview.travellers.children > 0
                            ? ` · ${aiProposalResult.tripOverview.travellers.children} Children`
                            : ""}
                    </div>
                </div>
            </div>

            <div
                style={{
                    borderTop: "1px solid #e2e8f0",
                    paddingTop: "6px",
                    marginBottom: "6px"
                }}
            >
                <div
                    style={{
                        fontSize: "10px",
                        color: "#64748b",
                        marginBottom: "3px",
                        textAlign: "left"
                    }}
                >
                    Recommended Route
                </div>

                <div
                    style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#0f172a",
                        textAlign: "left"
                    }}
                >
                    {aiProposalResult.route.recommendedRoute?.length
                        ? aiProposalResult.route.recommendedRoute.join(" → ")
                        : "-"}
                </div>
            </div>


            {aiProposalInputs?.mustVisit?.length > 0 && (
    <div
        style={{
            marginTop: "5px",
            marginBottom: "6px",
            fontSize: "10px",
            color: "#475569",
             textAlign: "left"
        }}
    >
        <strong>Must Visit:</strong>{" "}
        {aiProposalInputs.mustVisit.join(" • ")}
    </div>
)}



           <div
    style={{
        display: "flex",
        alignItems: "center",
        gap: "28px",
        marginBottom: "7px",
        fontSize: "10px",
        color: "#64748b"
    }}
>
    <div>
        <strong style={{ color: "#475569" }}>Entry:</strong>{" "}
        <span style={{ color: "#0f172a", fontWeight: 700 }}>
            {aiProposalResult.route.entryPoint || "-"}
        </span>
    </div>

    <div>
        <strong style={{ color: "#475569" }}>Exit:</strong>{" "}
        <span style={{ color: "#0f172a", fontWeight: 700 }}>
            {aiProposalResult.route.exitPoint || "-"}
        </span>
    </div>
</div>

            <div
                style={{
                    fontSize: "11px",
                    lineHeight: 1.5,
                    color: "#475569",
                    marginBottom: "6px"
                }}
            >
                <strong>Why this route:</strong>{" "}
                {aiProposalResult.route.routeReason || "-"}
            </div>

            {aiProposalResult.budgetPlanningNote && (
                <div
                    style={{
                        background: "#f1f5f9",
                        borderRadius: "7px",
                        padding: "10px",
                        fontSize: "11px",
                        color: "#334155"
                    }}
                >
                    <strong>Budget Planning:</strong>{" "}
                    {aiProposalResult.budgetPlanningNote}
                </div>
            )}

            {aiProposalResult.dayWiseItinerary?.length > 0 && (
    <div
        style={{
            borderTop: "1px solid #e2e8f0",
            paddingTop: "10px",
            marginTop: "10px"
        }}
    >
        <div
            style={{
                fontSize: "12px",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "10px"
            }}
        >
            Day-wise Itinerary
        </div>

        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px"
            }}
        >
            {aiProposalResult.dayWiseItinerary.map((day, index) => (
                <div
                    key={`${day.day || index}-${index}`}
                    style={{
                        display: "grid",
                        gridTemplateColumns: "58px 1fr",
                        gap: "8px",
                        padding: "6px 8px",
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "7px"
                    }}
                >
                    <div
                        style={{
                            fontSize: "11px",
                            fontWeight: 800,
                            color: "#475569"
                        }}
                    >
                        Day {day.day || index + 1}
                    </div>

                    <div>
                        <div
                            style={{
                                fontSize: "11px",
                                fontWeight: 800,
                                color: "#0f172a",
                                marginBottom: "3px"
                            }}
                        >
                            {day.title || "Itinerary"}
                        </div>

                        <div
                            style={{
                                fontSize: "11px",
                                lineHeight: 1.5,
                                color: "#475569"
                            }}
                        >
                            {day.description || "-"}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
)}

{aiProposalResult.whyThisItinerary?.length > 0 && (
    <div
        style={{
            borderTop: "1px solid #e2e8f0",
            paddingTop: "10px",
            marginTop: "10px"
        }}
    >
        <div
            style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "6px"
            }}
        >
            Why This Itinerary
        </div>

        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "3px"
            }}
        >
            {aiProposalResult.whyThisItinerary.map((reason, index) => (
                <div
                    key={`${reason}-${index}`}
                    style={{
                        fontSize: "10px",
                        lineHeight: 1.45,
                        color: "#475569"
                    }}
                >
                    • {reason}
                </div>
            ))}
        </div>
    </div>
)}


{aiProposalResult.seasonalInformation &&
    (
        aiProposalResult.seasonalInformation.season ||
        aiProposalResult.seasonalInformation.weather ||
        aiProposalResult.seasonalInformation.climateNote ||
        aiProposalResult.seasonalInformation.seasonalHighlights?.length ||
        aiProposalResult.seasonalInformation.seasonalAdvisory
    ) && (
        <div
            style={{
                borderTop: "1px solid #e2e8f0",
                paddingTop: "7px",
                marginTop: "7px"
            }}
        >
            <div
                style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: "#0f172a",
                    marginBottom: "4px"
                }}
            >
                Seasonal & Weather Information
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "3px 18px"
                }}
            >
                {aiProposalResult.seasonalInformation.season && (
                    <div style={{ fontSize: "10px", color: "#475569" }}>
                        <strong>Season:</strong>{" "}
                        {aiProposalResult.seasonalInformation.season}
                    </div>
                )}

                {aiProposalResult.seasonalInformation.weather && (
                    <div style={{ fontSize: "10px", color: "#475569" }}>
                        <strong>Weather:</strong>{" "}
                        {aiProposalResult.seasonalInformation.weather}
                    </div>
                )}

                {aiProposalResult.seasonalInformation.climateNote && (
                    <div
                        style={{
                            gridColumn: "1 / -1",
                            fontSize: "10px",
                            lineHeight: 1.45,
                            color: "#475569"
                        }}
                    >
                        <strong>Climate:</strong>{" "}
                        {aiProposalResult.seasonalInformation.climateNote}
                    </div>
                )}
            </div>

            {aiProposalResult.seasonalInformation.seasonalHighlights?.length >
                0 && (
                <div
                    style={{
                        marginTop: "3px",
                        fontSize: "10px",
                        lineHeight: 1.45,
                        color: "#475569"
                    }}
                >
                    <strong>Seasonal Highlights:</strong>{" "}
                    {aiProposalResult.seasonalInformation.seasonalHighlights.join(
                        " • "
                    )}
                </div>
            )}

            {aiProposalResult.seasonalInformation.seasonalAdvisory && (
                <div
                    style={{
                        marginTop: "3px",
                        fontSize: "10px",
                        lineHeight: 1.45,
                        color: "#475569"
                    }}
                >
                    <strong>Advisory:</strong>{" "}
                    {aiProposalResult.seasonalInformation.seasonalAdvisory}
                </div>
            )}
        </div>
    )}


{aiProposalResult.destinationHighlights?.length > 0 && (
    <div
        style={{
            borderTop: "1px solid #e2e8f0",
            paddingTop: "7px",
            marginTop: "7px"
        }}
    >
        <div
            style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "4px",
                textAlign: "left"
            }}
        >
            Destination Highlights
        </div>

        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "3px 14px"
            }}
        >
            {aiProposalResult.destinationHighlights.map(
                (highlight, index) => (
                    <div
                        key={`${highlight}-${index}`}
                        style={{
                            fontSize: "10px",
                            lineHeight: 1.4,
                            color: "#475569"
                        }}
                    >
                        • {highlight}
                    </div>
                )
            )}
        </div>
    </div>
)}


{aiProposalResult.travelTips?.length > 0 && (
    <div
        style={{
            borderTop: "1px solid #e2e8f0",
            paddingTop: "7px",
            marginTop: "7px"
        }}
    >
        <div
            style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "4px",
                textAlign: "left"
            }}
        >
            Travel Tips
        </div>

        <div
    style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "3px 14px"
    }}
>
            {aiProposalResult.travelTips.map((tip, index) => (
                <div
                    key={`${tip}-${index}`}
                    style={{
                        fontSize: "10px",
                        lineHeight: 1.4,
                        color: "#475569"
                    }}
                >
                    • {tip}
                </div>
            ))}
        </div>
    </div>
)}


{aiProposalResult.packingAdvice?.length > 0 && (
    <div
        style={{
            borderTop: "1px solid #e2e8f0",
            paddingTop: "7px",
            marginTop: "7px"
        }}
    >
        <div
            style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "4px",
                textAlign: "left"
            }}
        >
            Packing Advice
        </div>

        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "3px 14px"
            }}
        >
            {aiProposalResult.packingAdvice.map((item, index) => (
                <div
                    key={`${item}-${index}`}
                    style={{
                        fontSize: "10px",
                        lineHeight: 1.4,
                        color: "#475569"
                    }}
                >
                    • {item}
                </div>
            ))}
        </div>
    </div>
)}


{aiProposalResult.optionalExperiences?.length > 0 && (
    <div
        style={{
            borderTop: "1px solid #e2e8f0",
            paddingTop: "7px",
            marginTop: "7px"
        }}
    >
        <div
            style={{
                fontSize: "11px",
                fontWeight: 800,
                color: "#0f172a",
                marginBottom: "4px",
                textAlign: "left"
            }}
        >
            Optional Experiences
        </div>

        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "3px 14px"
            }}
        >
            {aiProposalResult.optionalExperiences.map(
                (experience, index) => (
                    <div
                        key={`${experience}-${index}`}
                        style={{
                            fontSize: "10px",
                            lineHeight: 1.4,
                            color: "#475569"
                        }}
                    >
                        • {experience}
                    </div>
                )
            )}
        </div>
    </div>
)}


{aiProposalResult.suggestedPace && (
    <div
        style={{
            borderTop: "1px solid #e2e8f0",
            paddingTop: "7px",
            marginTop: "7px",
            fontSize: "10px",
            lineHeight: 1.4,
            color: "#475569",
            textAlign: "left"
        }}
    >
        <strong style={{ color: "#0f172a" }}>
            Suggested Pace:
        </strong>{" "}
        {aiProposalResult.suggestedPace}
    </div>
)}


{aiProposalResult.finalPricingNote && (
    <div
        style={{
            marginTop: "5px",
            fontSize: "10px",
            lineHeight: 1.4,
            color: "#64748b",
            textAlign: "left"
        }}
    >
        <strong style={{ color: "#475569" }}>
            Pricing Note:
        </strong>{" "}
        {aiProposalResult.finalPricingNote}
    </div>
)}


{(aiProposalResult.packageIncludes?.length > 0 ||
    aiProposalResult.packageExcludes?.length > 0) && (
    <div
        style={{
            borderTop: "1px solid #e2e8f0",
            paddingTop: "7px",
            marginTop: "7px"
        }}
    >
        {aiProposalResult.packageIncludes?.length > 0 && (
            <div style={{ marginBottom: "6px" }}>
                <div
                    style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        color: "#0f172a",
                        marginBottom: "3px",
                        textAlign: "left"
                    }}
                >
                    Suggested Includes
                </div>

                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "3px 14px"
                    }}
                >
                    {aiProposalResult.packageIncludes.map(
                        (item, index) => (
                            <div
                                key={`${item}-${index}`}
                                style={{
                                    fontSize: "10px",
                                    lineHeight: 1.4,
                                    color: "#475569"
                                }}
                            >
                                • {item}
                            </div>
                        )
                    )}
                </div>
            </div>
        )}

        {aiProposalResult.packageExcludes?.length > 0 && (
            <div>
                <div
                    style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        color: "#0f172a",
                        marginBottom: "3px",
                        textAlign: "left"
                    }}
                >
                    Suggested Excludes
                </div>

                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "3px 14px"
                    }}
                >
                    {aiProposalResult.packageExcludes.map(
                        (item, index) => (
                            <div
                                key={`${item}-${index}`}
                                style={{
                                    fontSize: "10px",
                                    lineHeight: 1.4,
                                    color: "#475569"
                                }}
                            >
                                • {item}
                            </div>
                        )
                    )}
                </div>
            </div>
        )}
    </div>
)}









 </div>
    </div>
)}







        </div>


        {/* FOOTER */}

        <div
            style={{
                minHeight: "58px",
                padding: "10px 18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                gap: "8px",
                borderTop: "1px solid #e2e8f0",
                background: "#f8fafc"
            }}
        >

            <button
                type="button"
                onClick={() =>
                    setShowAIProposal(false)
                }
                style={{
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    color: "#334155",
                    borderRadius: "7px",
                    padding: "9px 16px",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontWeight: 700
                }}
            >
                Close
            </button>


<button
    type="button"
    onClick={() => {
        const confirmed = window.confirm(
            "Start over?\n\nThis will discard the current proposal changes and restore the original Lead information."
        );

        if (!confirmed) return;

        setAIProposalInputs({
            customer: selectedLead?.name || "",
            destination: selectedLead?.destination || "",
            travelMonth: selectedLead?.preferredMonth || "",
            duration: "",
           adults: selectedLead?.adults || 0,
children: selectedLead?.children || 0,

accommodationAdultPerNight: "",
transferPerDay: "",

travelFrom: selectedLead?.travelFrom || "",

            travelTo: selectedLead?.travelTo || "",

            travellerType: "",
            travelTheme: "",
            themeDetails: "",
            travelPace: "AI Recommended",
            accommodationPreference: "AI Recommended",
            transportPreference: "AI Recommended",

            mustVisit: [],
            specialPreferences: [],
            avoidPreferences: [],

            requirement:
                selectedLead?.requirement ||
                selectedLead?.notes ||
                ""
        });

        setAIProposalResult(null);
setAIProposalPreviewMode(false);

    }}

    
    style={{
        padding: "10px 16px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        background: "#fff",
        color: "#374151",
        fontWeight: 600,
        cursor: "pointer"
    }}
>
    ↺ Start Over
</button>


           <button
    type="button"
    disabled={aiProposalGenerating}
    onClick={async () => {
        const payload = buildAIProposalPayload(aiProposalInputs);


        setAIProposalResult(current => ({
    ...current,
    aiInputs: payload
}));




        setAIProposalGenerating(true);

        try {
           const prompt = buildAIProposalPrompt(payload);

console.log(
    "AI PROPOSAL PROMPT:",
    prompt
);

const response = await fetch(
    "http://127.0.0.1:38765/generate-ai-proposal",
    {
        method: "POST",

        headers: {
            "Content-Type":
                "application/json"
        },

        body: JSON.stringify({
            prompt,
            payload
        })
    }
);

const result =
    await response.json();

if (!response.ok || !result.success) {

    throw new Error(
        result.error ||
        "AI proposal generation failed."
    );
}



// The generated proposal belongs to the currently selected Lead
setAIProposalLeadId(
    selectedLead?.id || null
);

setAIProposalResult(
    result.proposal
);





setAIProposalPreviewMode(false);

setShowAIProposal(false);
setShowAIWhatsAppEditor(true);
        } finally {
            setAIProposalGenerating(false);
        }
    }}
    style={{
        border: "none",
        background: aiProposalGenerating
            ? "#94a3b8"
            : "#94a3b8",
        color: "#fff",
        borderRadius: "7px",
        padding: "9px 16px",
        cursor: aiProposalGenerating
            ? "default"
            : "pointer",
        fontSize: "11px",
        fontWeight: 700
    }}
>
    {aiProposalGenerating
        ? "⏳ Generating..."
        : "✨ Generate Proposal"}
</button>


<button
    type="button"
    onClick={e => {
    e.preventDefault();
    e.stopPropagation();

    if (!aiProposalResult) {
        return;
    }

    setShowAIProposal(false);
    setAIProposalPreviewMode(false);
    setShowAIWhatsAppEditor(true);
}}
    disabled={!aiProposalResult}
    style={{
        border: "1px solid #cbd5e1",
        background: aiProposalResult
            ? "#ffffff"
            : "#f1f5f9",
        color: aiProposalResult
            ? "#334155"
            : "#94a3b8",
        borderRadius: "7px",
        padding: "9px 16px",
        cursor: aiProposalResult
            ? "pointer"
            : "not-allowed",
        fontSize: "11px",
        fontWeight: 700,
        marginLeft: "8px"
    }}
>
    → Go to Generated Proposal
</button>




        </div>

    </div>
)}

{showAIWhatsAppEditor && aiProposalResult && (
    <ProposalEditor
        proposal={aiProposalResult}
        onChange={setAIProposalResult}
        isLibraryResume={isLibraryResume}
        
       onClose={() => {
    setShowAIWhatsAppEditor(false);

    if (isLibraryResume) {
        if (typeof onBackToProposalLibrary === "function") {
            onBackToProposalLibrary();
        }
        return;
    }

    setShowAIProposal(true);
}}

        onWhatsApp={async (proposal) => {

            const mobile =
                String(
                    selectedLead?.mobile || ""
                ).replace(/\D/g, "");

            if (!mobile) {
                alert(
                    "This lead does not have a valid mobile number."
                );
                return;
            }

            const message =
                buildProposalWhatsAppMessage(
                    proposal
                );

            if (!message) {
                alert(
                    "WhatsApp message could not be prepared."
                );
                return;
            }

            try {

                const response =
                    await fetch(
                        "http://127.0.0.1:38765/prepare-whatsapp-message",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                mobile,
                                message
                            })
                        }
                    );

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message ||
                        "WhatsApp preparation failed."
                    );
                }

                console.log(
                    "WhatsApp message prepared:",
                    result
                );

            } catch (error) {

                console.error(
                    "WhatsApp preparation error:",
                    error
                );

                alert(
                    "Could not prepare WhatsApp message.\n\n" +
                    "Please make sure Orbitz Helper is running."
                );
            }
        }}

        onEmail={async (proposal) => {

            const email =
                String(
                    selectedLead?.email || ""
                ).trim();

            if (!email) {
                alert(
                    "This lead does not have an email address."
                );
                return;
            }

           const customerName =
    String(
        selectedLead?.name ||
        "Customer"
    )
        .replace(/\r?\n/g, " ")
        .trim();

            const proposalTitle =
                String(
                    proposal?.proposalTitle ||
                    "Your Travel Proposal"
                ).trim();

            const subject =
                `${proposalTitle} - Orbitz Holidays`;

            const message =
                `Dear ${customerName},\n\n` +
                `Thank you for giving Orbitz Holidays the opportunity to plan your trip.\n\n` +
                `We have prepared your ${proposalTitle} based on your travel requirements.\n\n` +
                `Please review the proposal and feel free to contact us if you would like any changes or further assistance.\n\n` +
                `Warm regards,\n` +
                `Team Orbitz Holidays`;

            try {

                const response =
                    await fetch(
                        "http://127.0.0.1:38765/prepare-proposal-email",
                        {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/json"
                            },
                            body: JSON.stringify({
                                email,
                                subject,
                                message
                            })
                        }
                    );

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error ||
                        result.message ||
                        "Email preparation failed."
                    );
                }

                console.log(
                    "Proposal email prepared:",
                    result
                );

            } catch (error) {

                console.error(
                    "Proposal email preparation error:",
                    error
                );

                alert(
                    "Could not prepare the proposal email.\n\n" +
                    "Please make sure Orbitz Helper is running."
                );
            }
        }}

        onDownloadDocx={async (proposal) => {

    try {

       await saveProposalToLibrary(
    proposal,
    "",
    selectedLead?.id || "",
    selectedLead?.clientId || "",
    userProfile,
    setAIProposalResult
);

    } catch (error) {

        console.error(
            "Save & Generate DOCX error:",
            error
        );

        alert(
            "The proposal could not be saved to Proposal Library."
        );
    }
}}
    />
)}



{editingClient && (
    <div
        style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: "420px",
            maxWidth: "90vw",
            background: "#fff",
            boxShadow:
                "-8px 0 30px rgba(15, 23, 42, 0.16)",
            borderLeft: "1px solid #dbe3ea",
            zIndex: 1003,
            display: "flex",
            flexDirection: "column"
        }}
    >
        <div
            style={{
                minHeight: "58px",
                padding: "10px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #e2e8f0",
                background: "#f8fafc"
            }}
        >
            <div>
                <div
                    style={{
                        fontSize: "15px",
                        fontWeight: 800,
                        color: "#172033"
                    }}
                >
                    Add Client
                </div>

                <div
                    style={{
                        marginTop: "2px",
                        fontSize: "11px",
                        color: "#64748b"
                    }}
                >
                    From Lead: {selectedLead?.name || "—"}
                </div>
            </div>

            <button
                type="button"
                onClick={() =>
                    setEditingClient(null)
                }
                style={{
                    width: "30px",
                    height: "30px",
                    border: "none",
                    borderRadius: "7px",
                    background: "#e2e8f0",
                    color: "#334155",
                    cursor: "pointer",
                    fontSize: "18px"
                }}
            >
                ×
            </button>
        </div>

        <div
            style={{
                flex: 1,
                overflowY: "auto",
                padding: "18px"
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px"
                }}
            >

                <div>
                    <label style={labelStyle}>
                        Client / Agency Name *
                    </label>

                    <input
                        value={
                            editingClient.clientName || ""
                        }
                        onChange={e =>
                            setEditingClient({
                                ...editingClient,
                                clientName:
                                    e.target.value
                            })
                        }
                        style={fieldStyle}
                    />
                </div>

                <div>
                    <label style={labelStyle}>
                        Contact Person
                    </label>

                    <input
                        value={
                            editingClient.contactPerson || ""
                        }
                        onChange={e =>
                            setEditingClient({
                                ...editingClient,
                                contactPerson:
                                    e.target.value
                            })
                        }
                        style={fieldStyle}
                    />
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "1fr 1fr",
                        gap: "12px"
                    }}
                >
                    <div>
                        <label style={labelStyle}>
                            Mobile
                        </label>

                        <input
                            value={
                                editingClient.mobile || ""
                            }
                            onChange={e =>
                                setEditingClient({
                                    ...editingClient,
                                    mobile:
                                        e.target.value
                                })
                            }
                            style={fieldStyle}
                        />
                    </div>

                    <div>
                        <label style={labelStyle}>
                            Email
                        </label>

                        <input
                            type="email"
                            value={
                                editingClient.email || ""
                            }
                            onChange={e =>
                                setEditingClient({
                                    ...editingClient,
                                    email:
                                        e.target.value
                                })
                            }
                            style={fieldStyle}
                        />
                    </div>
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "1fr 1fr",
                        gap: "12px"
                    }}
                >
                    <div>
                        <label style={labelStyle}>
                            Client Type
                        </label>

                        <select
                            value={
                                editingClient.clientType ||
                                "Individual"
                            }
                            onChange={e =>
                                setEditingClient({
                                    ...editingClient,
                                    clientType:
                                        e.target.value
                                })
                            }
                            style={fieldStyle}
                        >
                            <option value="Individual">
                                Individual
                            </option>
                            <option value="Agency">
                                Agency
                            </option>
                            <option value="Corporate">
                                Corporate
                            </option>
                        </select>
                    </div>

                    <div>
                        <label style={labelStyle}>
                            Status
                        </label>

                        <select
                            value={
                                editingClient.status ||
                                "Active"
                            }
                            onChange={e =>
                                setEditingClient({
                                    ...editingClient,
                                    status:
                                        e.target.value
                                })
                            }
                            style={fieldStyle}
                        >
                            <option value="Active">
                                Active
                            </option>
                            <option value="Inactive">
                                Inactive
                            </option>
                        </select>
                    </div>
                </div>

                <div>
                    <label style={labelStyle}>
                        City
                    </label>

                    <input
                        value={
                            editingClient.city || ""
                        }
                        onChange={e =>
                            setEditingClient({
                                ...editingClient,
                                city:
                                    e.target.value
                            })
                        }
                        style={fieldStyle}
                    />
                </div>

                <div>
                    <label style={labelStyle}>
                        Address
                    </label>

                    <textarea
                        value={
                            editingClient.address || ""
                        }
                        onChange={e =>
                            setEditingClient({
                                ...editingClient,
                                address:
                                    e.target.value
                            })
                        }
                        rows={3}
                        style={{
                            ...fieldStyle,
                            resize: "vertical"
                        }}
                    />
                </div>

                <div>
                    <label style={labelStyle}>
                        Source
                    </label>

                    <input
                        value={
                            editingClient.source || ""
                        }
                        onChange={e =>
                            setEditingClient({
                                ...editingClient,
                                source:
                                    e.target.value
                            })
                        }
                        style={fieldStyle}
                    />
                </div>

                <div>
                    <label style={labelStyle}>
                        Notes
                    </label>

                    <textarea
                        value={
                            editingClient.notes || ""
                        }
                        onChange={e =>
                            setEditingClient({
                                ...editingClient,
                                notes:
                                    e.target.value
                            })
                        }
                        rows={4}
                        style={{
                            ...fieldStyle,
                            resize: "vertical"
                        }}
                    />
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "flex-end",
                        gap: "8px",
                        paddingTop: "4px",
                        paddingBottom: "10px"
                    }}
                >
                    <button
                        type="button"
                        onClick={() =>
                            setEditingClient(null)
                        }
                        style={{
                            background: "#e2e8f0",
                            color: "#334155",
                            border: "none",
                            borderRadius: "7px",
                            padding: "9px 16px",
                            cursor: "pointer",
                            fontWeight: 700
                        }}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={async () => {
                            if (
                                !editingClient.clientName.trim()
                            ) {
                                alert(
                                    "Client / Agency Name is required."
                                );
                                return;
                            }

                           try {
    const newClient =
        await createClient(
            editingClient
        );

    const savedClients =
        await getClients();

    setClients(
        savedClients
    );

    await updateLead(
    selectedLead.id,
    {
        clientId:
            newClient.clientId,
        clientDocId:
            newClient.id,
        clientRelationshipType:
            "created"
    }
);

    setLeads(previous =>
    previous.map(lead =>
        lead.id === selectedLead.id
            ? {
                ...lead,
                clientId:
                    newClient.clientId,
                clientDocId:
                    newClient.id,
                clientRelationshipType:
                    "created"
            }
            : lead
    )
);

    setSelectedLead(previous =>
    previous
        ? {
            ...previous,
            clientId:
                newClient.clientId,
            clientDocId:
                newClient.id,
            clientRelationshipType:
                "created"
        }
        : previous
);

   setLinkedClient({
    client: newClient,
    possibleClients: [],
    relationshipType: "created"
});

setEditingClient(null);

} catch (error) {

                                console.error(
                                    "Failed to create client:",
                                    error
                                );

                                alert(
                                    "Unable to create client. Please try again."
                                );
                            }
                        }}
                        style={{
                            background: "#0f766e",
                            color: "#fff",
                            border: "none",
                            borderRadius: "7px",
                            padding: "9px 16px",
                            cursor: "pointer",
                            fontWeight: 700
                        }}
                    >
                        Save Client
                    </button>
                </div>


               



            </div>
        </div>
    </div>
)}


 {viewedClient && (
    <ClientDetailsModal
        client={viewedClient}
        leads={leads.filter(lead =>
            (
                viewedClient.clientDocId &&
                lead.clientDocId ===
                    viewedClient.clientDocId
            ) ||
            (
                viewedClient.clientId &&
                lead.clientId ===
                    viewedClient.clientId
            )
        )}

            quotations={quotations.filter(
        quotation =>
            viewedClient.clientId &&
            quotation.clientId ===
                viewedClient.clientId
    )}

    
        onClose={() =>
            setViewedClient(null)
        }
        onEdit={client => {
            setViewedClient(null);
            setEditingClient(client);
        }}

        onOpenLead={lead => {
    setClientBeforeLead(viewedClient);
    setViewedClient(null);
    setSelectedLead(lead);
}}

        showDelete={false}
    />
)}


        </div>
        
    );
}