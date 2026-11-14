/**
 * RETIRED 15 September 2026. DO NOT RUN.
 *
 * Michael uses Jotform for mentor intake, not this Google Form:
 *   
 *
 * The form and response sheet this script created have been moved to Drive
 * trash. The sheet took zero responses, so nothing was migrated. This file is
 * kept only as the reference list of fields the intake needs to capture.
 *
 * Build for Breakpoint, mentor onboarding form builder
 * Foundation Ventures, run once in Google Apps Script
 *
 * WHAT IT DOES
 *   Creates the form, every question, a linked response spreadsheet, and
 *   shares that spreadsheet with your account so Claude can read
 *   submissions straight out of Drive with no export step.
 *
 * HOW TO RUN
 *   1. script.google.com, New project
 *   2. Delete what is in the editor, paste all of this in
 *   3. Save, press Run, pick buildMentorForm
 *   4. Approve the permission prompt (your own script, your own Drive, first run only)
 *   5. Open the Execution log. It prints the live form link and the response
 *      sheet link. Send me the sheet link.
 *
 * TO CHANGE ANYTHING
 *   Edit below and run again. It builds a NEW form each time, so bin the old
 *   one if you do not want duplicates.
 */

// Headshot and logo as Drive uploads. Uploads REQUIRE the mentor to be signed
// into a Google account. Set false to ask for links instead, which anyone can answer.
// FALSE on purpose: senior mentors outside the crypto world drop off at a Google
// sign-in wall, and a completed form matters more than tidy file handling.
var USE_FILE_UPLOADS = false;

// Where Claude reads from.
var SHARE_SHEET_WITH = '';

// Time bands, exactly as agreed.
var BANDS = ['Morning, 10am to 12', 'Afternoon, 12 to 4', 'Evening, 4 to 8'];

// Programme weeks. Each entry is the Monday. Runs to the week before Breakpoint.
var WEEK_MONDAYS = [
  [2026, 8, 14],  [2026, 8, 21],  [2026, 8, 28],   // September
  [2026, 9, 5],   [2026, 9, 12],  [2026, 9, 19],  [2026, 9, 26],  // October
  [2026, 10, 2],  [2026, 10, 9]   // November, up to Breakpoint week
];

var SESSIONS = [
  'Customer Discovery & GTM',
  'Product, Design & Value',
  'Retention & Growth',
  'Narrative, Commercial KPIs & Funding',
  'Accelerator Application Clinic',
  'Founder Brand, Media & Socials',
  'Solana DevRel & Integration',
  'Hardware and Deep Tech, design partners and pilots',
  'Legal, Tax & IP',
  'Security & Audit',
  'Customer Discovery That Doesn’t Lie',
  'From Problem to Buying Trigger',
  'Design the Smallest Test That Can Prove Value',
  'Design Partners, Pilots and First Paid Proof',
  'Metrics That Matter, Commercial KPIs',
  'Fund the Next Proof',
  'Retention and Pull by Company Type',
  'Founder Brand as Distribution',
  'Not sure yet, happy to be placed'
];

var STAGES = [
  'Need, is there a real need here?',
  'Value, does what we made create real value?',
  'Pull, do people keep choosing it?',
  'Growth, can we create more of that value repeatedly?',
  'Funding, can we fund the next proof?',
  'Not sure, you decide'
];

var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function label_(d) {
  return DAY_NAMES[d.getDay()] + ' ' + d.getDate() + ' ' + MONTH_NAMES[d.getMonth()];
}

function buildMentorForm() {
  var form = FormApp.create('Build for Breakpoint, Mentor Onboarding');

  form.setTitle('Build for Breakpoint, Mentor Onboarding')
      .setDescription(
        'Thanks for agreeing to help. Build for Breakpoint is Superteam UK’s founder programme ' +
        'running up to Solana Breakpoint in London this November.\n\n' +
        'Five minutes. It gives us everything we need to schedule you, promote your session ' +
        'properly and get founders in the room prepared.\n\n' +
        'Curated by Superteam UK and Foundation Ventures.')
      .setCollectEmail(true)
      .setProgressBar(true)
      .setAllowResponseEdits(true)
      .setConfirmationMessage(
        'Thank you. Michael will come back with proposed dates and a short brief. ' +
        'If anything changes, use the edit link in your confirmation email.');

  // ── 1. ABOUT YOU ──────────────────────────────────────────────
  form.addSectionHeaderItem().setTitle('About you');

  form.addTextItem().setTitle('Full name').setRequired(true);
  form.addTextItem().setTitle('Preferred name')
      .setHelpText('What we call you on the day, if different.');
  form.addTextItem().setTitle('Company').setRequired(true);
  form.addTextItem().setTitle('Job title').setRequired(true)
      .setHelpText('Exactly as you want it on the promo card.');
  form.addTextItem().setTitle('Social media handle').setRequired(true)
      .setHelpText('The one you actually use and want tagged. X, LinkedIn, Farcaster, whichever.');
  form.addTextItem().setTitle('LinkedIn URL').setRequired(true);
  form.addTextItem().setTitle('Any other handle worth tagging');
  form.addTextItem().setTitle('Company website');

  // ── 2. WHAT YOU WILL RUN ──────────────────────────────────────
  form.addPageBreakItem().setTitle('What you will run')
      .setHelpText('You can do both. Tick whatever you are up for.');

  form.addMultipleChoiceItem().setTitle('Would you run a WORKSHOP?')
      .setHelpText('You present with slides, 45 to 60 minutes, recorded and added to the library. Usually one off.')
      .setChoiceValues(['Yes', 'No'])
      .setRequired(true);

  form.addMultipleChoiceItem().setTitle('Would you run OFFICE HOURS?')
      .setHelpText('Roundtable clinic, around four founders, everyone gets a question. Conversational, no slides needed. Can recur.')
      .setChoiceValues(['Yes', 'No'])
      .setRequired(true);

  form.addListItem().setTitle('Which session?')
      .setHelpText('If you have spoken to Michael or Cap, pick the one you discussed. Otherwise take the last option.')
      .setChoiceValues(SESSIONS)
      .setRequired(true);

  form.addTextItem().setTitle('Your session title')
      .setHelpText('How you want it billed. Under about ten words.')
      .setRequired(true);

  form.addParagraphTextItem().setTitle('What is it about?')
      .setHelpText('Two or three sentences. This goes on the event page, so write it for a founder deciding whether to turn up.')
      .setRequired(true);

  form.addParagraphTextItem().setTitle('What does a founder leave with?')
      .setHelpText('The most useful thing you can tell us. One concrete outcome beats a list of topics.')
      .setRequired(true);

  form.addCheckboxItem().setTitle('Which stage does it help with?')
      .setHelpText('Founders move through five stages on our board. Tick all that apply.')
      .setChoiceValues(STAGES)
      .setRequired(true);

  form.addParagraphTextItem().setTitle('Anything founders should bring or prepare?')
      .setHelpText('Current metrics, a deck, a live product. Leave blank if nothing.');

  // ── 3. AVAILABILITY ───────────────────────────────────────────
  form.addPageBreakItem().setTitle('When can you do it?')
      .setHelpText(
        'Tick every slot that could work. Take as many as you like, more options means we are far more ' +
        'likely to find a time that suits you.\n\n' +
        'Only fill in the weeks that work for you and scroll past the rest. Nothing here is required.');

  for (var w = 0; w < WEEK_MONDAYS.length; w++) {
    var mon = new Date(WEEK_MONDAYS[w][0], WEEK_MONDAYS[w][1], WEEK_MONDAYS[w][2]);
    var rows = [];
    for (var i = 0; i < 5; i++) {
      var d = new Date(mon.getTime());
      d.setDate(mon.getDate() + i);
      rows.push(label_(d));
    }
    form.addCheckboxGridItem()
        .setTitle('Week of ' + label_(mon).replace(/^Mon /, ''))
        .setRows(rows)
        .setColumns(BANDS);
  }

  form.addParagraphTextItem().setTitle('Anything else on timing?')
      .setHelpText('Dates you definitely cannot do, notice you need, or if you would rather we just proposed something.');

  form.addTextItem().setTitle('Your booking link')
      .setHelpText(
        'Calendly, Cal.com, Google Calendar appointment page, anything. This is how founders with a Keys ' +
        'pass book one to one time with you, and it saves a scheduling back and forth.');

  form.addTextItem().setTitle('Timezone')
      .setHelpText('Only if you are not on UK time.');

  form.addMultipleChoiceItem().setTitle('In person or virtual?')
      .setHelpText('Virtual reaches founders across the whole UK. In person happens at the Superteam UK office in London.')
      .setChoiceValues(['Virtual', 'In person in London', 'Either'])
      .setRequired(true);

  // ── 4. ASSETS ─────────────────────────────────────────────────
  form.addPageBreakItem().setTitle('Assets')
      .setHelpText('This is what lets us promote your session properly rather than posting a name and a time.');

  form.addTextItem().setTitle('One line bio').setRequired(true)
      .setHelpText('Under 20 words. Goes on the promo card and the mentor directory.');

  form.addParagraphTextItem().setTitle('Longer bio')
      .setHelpText('Two or three sentences for the event page. Third person is fine.')
      .setRequired(true);

  if (USE_FILE_UPLOADS) {
    form.addFileUploadItem().setTitle('Headshot')
        .setHelpText('Square if possible, at least 800 by 800. Landscape is fine, we will crop.');
    form.addFileUploadItem().setTitle('Company logo')
        .setHelpText('PNG with a transparent background if you have one.');
    form.addFileUploadItem().setTitle('Short intro video, optional but it helps a lot')
        .setHelpText(
          'Thirty to sixty seconds on your phone, landscape. Who you are, what you do, what your session ' +
          'covers. We use it as a moving profile card on the promo post, and those get far more attention ' +
          'than a static image.');
  } else {
    form.addTextItem().setTitle('Headshot link')
        .setHelpText('Drive, Dropbox or any URL we can download from. Square if possible, at least 800 by 800.');
    form.addTextItem().setTitle('Company logo link')
        .setHelpText('PNG with a transparent background if you have one.');
    form.addTextItem().setTitle('Short intro video link, optional but it helps a lot')
        .setHelpText('Thirty to sixty seconds on your phone, landscape. Who you are, what you do, what your session covers.');
  }

  // ── 5. ADMIN AND CONSENT ──────────────────────────────────────
  form.addPageBreakItem().setTitle('Last bit');

  form.addTextItem().setTitle('Telegram handle')
      .setHelpText('Most day to day coordination happens on Telegram. Without the @.');

  form.addMultipleChoiceItem().setTitle('Happy for your session to be recorded?')
      .setHelpText(
        'Recordings go into the Superteam UK library, public on YouTube and up permanently. It is how ' +
        'founders who could not attend still benefit, and it is credited to you.')
      .setChoiceValues([
        'Yes, record and publish it',
        'Record it but keep it internal to the programme',
        'No recording please'
      ])
      .setRequired(true);

  form.addMultipleChoiceItem().setTitle('Happy for us to use your name and logo in promotion?')
      .setChoiceValues(['Yes', 'Name only, not the logo', 'Please check with me first'])
      .setRequired(true);

  form.addParagraphTextItem().setTitle('Accessibility or dietary needs')
      .setHelpText('Only if you are coming in person and there is something we should know.');

  form.addParagraphTextItem().setTitle('Anything else?')
      .setHelpText('Including anyone else you think should be mentoring on this programme.');

  // ── RESPONSE SHEET ────────────────────────────────────────────
  var ss = SpreadsheetApp.create('Build for Breakpoint, Mentor Onboarding (Responses)');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  try {
    DriveApp.getFileById(ss.getId()).addViewer(SHARE_SHEET_WITH);
  } catch (e) {
    Logger.log('Could not auto-share the sheet: ' + e.message);
    Logger.log('Share it manually with ' + SHARE_SHEET_WITH + ', Viewer is enough.');
  }

  Logger.log('=================================================');
  Logger.log('LIVE FORM  (send to mentors):');
  Logger.log(form.getPublishedUrl());
  Logger.log('');
  Logger.log('EDIT FORM  (yours):');
  Logger.log(form.getEditUrl());
  Logger.log('');
  Logger.log('RESPONSE SHEET  (send this link to Claude):');
  Logger.log(ss.getUrl());
  Logger.log('');
  Logger.log('Shared with: ' + SHARE_SHEET_WITH);
  Logger.log('Availability grids: ' + WEEK_MONDAYS.length + ' weeks x 5 days x ' + BANDS.length + ' bands');
  Logger.log('File uploads: ' + (USE_FILE_UPLOADS ? 'ON, mentors must be signed into Google' : 'OFF, asking for links'));
  Logger.log('=================================================');
}
