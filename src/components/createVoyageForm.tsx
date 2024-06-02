"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { fetchData } from "~/utils";
import { VesselsType } from "~/pages/api/vessel/getAll";
import { MultiSelect } from "./multiSelect";
import { Dropdown } from "./dropdown";

// Define schema for form validation
const voyageSchema = z
  .object({
    departure: z.string().min(1, "Departure is required"),
    arrival: z.string().min(1, "Arrival is required"),
    portOfLoading: z.string().min(1, "Port of loading is required"),
    portOfDischarge: z.string().min(1, "Port of discharge is required"),
    vessel: z.string().min(1, "Vessel is required"),
    unitTypes: z
      .array(z.string())
      .nonempty("At least one unit type is required"),
  })
  .refine((data) => new Date(data.arrival) > new Date(data.departure), {
    message: "Arrival date must be after departure date",
    path: ["arrival"],
  });

type VoyageFormData = z.infer<typeof voyageSchema>;

interface CreateVoyageFormProps {
  onSuccess: () => void;
}

const CreateVoyageForm: React.FC<CreateVoyageFormProps> = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<VoyageFormData>({
    resolver: zodResolver(voyageSchema),
  });

  const queryClient = useQueryClient();

  // Fetching vessels
  const {
    data: vessels,
    isLoading: vesselsLoading,
    isError: vesselsError,
  } = useQuery<VesselsType[]>({
    queryKey: ["vessels"],
    queryFn: () => fetchData("vessel/getAll"),
  });

  // Fetching unit types
  const {
    data: unitTypesData,
    isLoading: unitTypesLoading,
    isError: unitTypesError,
  } = useQuery<UnitType[]>({
    queryKey: ["unitTypes"],
    queryFn: () => fetchData("unitType/getAll"),
  });

  useEffect(() => {
    if (vesselsError) console.error("Error fetching vessels");
    if (unitTypesError) console.error("Error fetching unit types");
  }, [vesselsError, unitTypesError]);

  useEffect(() => {
    if (vessels) {
      console.log("Fetched vessels:", vessels);
    }
  }, [vessels]);

  // Transform unitTypes data to expected structure
  const unitTypes =
    unitTypesData?.map((unit) => ({
      value: unit.id,
      label: unit.name,
    })) || [];

  // The vesselOptions directly use the response structure
  const vesselOptions = vessels || [];

  useEffect(() => {
    console.log("Transformed vessel options:", vesselOptions);
  }, [vesselOptions]);

  const [selectedVessel, setSelectedVessel] = useState("");
  const [selectedUnitTypes, setSelectedUnitTypes] = useState<
    { value: string; label: string }[]
  >([]);
  const [portOfLoading, setPortOfLoading] = useState("");
  const [portOfDischarge, setPortOfDischarge] = useState("");

  useEffect(() => {
    setValue("vessel", selectedVessel);
  }, [selectedVessel, setValue]);

  useEffect(() => {
    setValue(
      "unitTypes",
      selectedUnitTypes.map((ut) => ut.value),
    );
  }, [selectedUnitTypes, setValue]);

  // Creating a new voyage
  const createVoyageMutation = useMutation({
    mutationFn: async (data: VoyageFormData) => {
      console.log("Submitting data:", data); // Print the submission data for debugging
      const response = await fetch("/api/voyage/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      if (!response.ok) {
        throw new Error(
          `Failed to create voyage: ${response.status} ${response.statusText}`,
        );
      }

      try {
        return JSON.parse(responseText);
      } catch (error) {
        throw new Error(`Failed to parse response: ${error.message}`);
      }
    },
    onSuccess: () => {
      console.log("Voyage created successfully");
      onSuccess(); // Call the onSuccess callback
    },
    onError: (error) => {
      console.error("Error creating voyage:", error);
    },
  });

  const onSubmit = (data: VoyageFormData) => {
    data.departure = new Date(data.departure).toISOString();
    data.arrival = new Date(data.arrival).toISOString();

    // Ensure these values are set correctly in the form data
    data.vessel = selectedVessel;
    data.unitTypes = selectedUnitTypes.map((ut) => ut.value);

    createVoyageMutation.mutate(data);
  };

  const handlePortOfLoadingChange = (selectedPort: string) => {
    setPortOfLoading(selectedPort);
    setValue("portOfLoading", selectedPort);

    if (selectedPort === "Copenhagen") {
      setPortOfDischarge("Oslo");
      setValue("portOfDischarge", "Oslo");
    } else if (selectedPort === "Oslo") {
      setPortOfDischarge("Copenhagen");
      setValue("portOfDischarge", "Copenhagen");
    } else {
      setPortOfDischarge("");
      setValue("portOfDischarge", "");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label>Departure Date</label>
        <Input type="datetime-local" {...register("departure")} />
        {errors.departure && <p>{errors.departure.message}</p>}
      </div>
      <div>
        <label>Arrival Date</label>
        <Input type="datetime-local" {...register("arrival")} />
        {errors.arrival && <p>{errors.arrival.message}</p>}
      </div>
      <div>
        <Dropdown
          label="Select Port of Loading"
          items={[
            { value: "Copenhagen", label: "Copenhagen" },
            { value: "Oslo", label: "Oslo" },
          ]}
          selectedItem={portOfLoading}
          setSelectedItem={handlePortOfLoadingChange}
        />
        {errors.portOfLoading && <p>{errors.portOfLoading.message}</p>}
      </div>
      <div>
        <label>Port of Discharge</label>
        <Input
          className="shadow-none"
          type="text"
          value={portOfDischarge}
          readOnly
          {...register("portOfDischarge")}
        />
        {errors.portOfDischarge && <p>{errors.portOfDischarge.message}</p>}
      </div>
      <div>
        <Dropdown
          label="Select Vessel"
          items={vesselOptions}
          selectedItem={selectedVessel}
          setSelectedItem={setSelectedVessel}
        />
        {errors.vessel && <p>{errors.vessel.message}</p>}
      </div>
      <div>
        <label>Unit Types</label>
        <MultiSelect
          unitTypes={unitTypes}
          selected={selectedUnitTypes}
          setSelected={setSelectedUnitTypes}
        />
        {errors.unitTypes && <p>{errors.unitTypes.message}</p>}
      </div>
      <Button type="submit">Create</Button>
    </form>
  );
};

export default CreateVoyageForm;
