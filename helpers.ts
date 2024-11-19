import { FunctionsDocument } from "@models/Functions.model";
import { PersonalAccessDocument } from "@models/PersonalAceess.model";
import { LeanDocument, Types } from "mongoose";

export const checkForAndRoles = (data: { functions: any[]; }) => {
  
  if (!data || !Array.isArray(data.functions)) {
    console.log(data);
    throw new Error("Invalid input data");
  }

  // Filter out functions that have empty "for" values
  data.functions = data.functions.filter((func: { name?: string; for?: any[]; roles?: any[]; }) => {
      // Check for null or undefined values and remove them
      if (typeof func.name === 'string' && func.name.trim() === '') {
          delete func.name;
      }

      // Filter "for" values and check if it's empty after filtering
      if (func.for) {
          func.for = func.for.filter((item: null | undefined) => item !== null && item !== undefined && item !== 'null' && item !== 'undefined');
      }

      // Filter "roles" values
      if (func.roles) {
          func.roles = func.roles.filter((item: null | undefined) => item !== null && item !== undefined && item !== 'null' && item !== 'undefined');
      }

      // Return true if "for" is not empty after filtering
      return func.for && func.for.length > 0;
  });

  return data;
};


export const getAllowedFunctions = (
    orgFunctions: LeanDocument<FunctionsDocument & { _id: Types.ObjectId }>, 
    personalAccess: LeanDocument<PersonalAccessDocument & { _id: Types.ObjectId }>, 
    groups: any[]
  ) => {
    const allowedFunctions = {};
    
    orgFunctions.functions.forEach((orgFunc: { name: String, for: String[], plan: String}) => {
      if(orgFunc.for.length) {
        personalAccess.functions.forEach((personalFunc: { name: String, for: String[], roles: String[]}) => {
          if(personalFunc.name == orgFunc.name) {
            allowedFunctions[`${personalFunc.name}`] = {
              ...personalFunc,
              for: personalFunc.for.filter(item => orgFunc.for.includes(item))
            };
          }
        });
    
        groups.forEach((group: { functions: [] }) => group.functions.forEach((groupFunc: { name: String, for: String[], roles: String[]}) => {
          if(groupFunc.name == orgFunc.name) {
            if(allowedFunctions[`${groupFunc.name}`]) {
    
              // Combining Roles
              const allowedRoles = allowedFunctions[`${groupFunc.name}`].roles; // Assuming this is an array
              const groupRoles = groupFunc.roles; // Assuming this is also an array
              const combinedRoles = [...new Set([...allowedRoles, ...groupRoles])]; // Unique roles
    
              // Combining Allowed For
              const allowedFor = allowedFunctions[`${groupFunc.name}`].for; // Assuming this is an array
              const groupFor = groupFunc.for; // Assuming this is also an array
              const combinedFor = [...new Set([...allowedFor, ...groupFor])]; // Unique allowedFor              
    
              if(combinedRoles.length && combinedFor.length) {
                allowedFunctions[`${groupFunc.name}`] = {
                  ...allowedFunctions[`${groupFunc.name}`],
                  roles: combinedRoles,
                  for: combinedFor.filter(item => orgFunc.for.includes(item))
                }
              }
            } else {
              allowedFunctions[`${groupFunc.name}`] = groupFunc
            }
          }
        }));
      }
    })
  
    // Return the allowed functions with merged roles
    return Object.values(allowedFunctions);
};